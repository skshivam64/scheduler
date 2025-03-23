import grpc
import os
import redis
import subprocess
import threading
import time
import logging
from celery import Celery
from datetime import datetime
from google.protobuf.empty_pb2 import Empty
from proto.job_pb2 import CreateJobRequest, UpdateJobRequest, ListJobsRequest, GetJobRequest
from proto.job_pb2_grpc import JobStub
from proto.schedule_pb2_grpc import ScheduleStub
from croniter import croniter
from datetime import datetime

MAX_QUEUE_SIZE = 2

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Celery configuration
app = Celery("scheduler", broker=os.getenv(
    "REDIS_URL", "redis://localhost:6379/0"))
redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"))


def get_grpc_client(service):
    channel = grpc.insecure_channel(
        "localhost:50051")  # Adjust as per deployment
    return service(channel)


job_client = get_grpc_client(JobStub)
schedule_client = get_grpc_client(ScheduleStub)


def acquire_lock(key, expiry=10):
    return redis_client.set(key, "locked", ex=expiry, nx=True)


def release_lock(key):
    redis_client.delete(key)


def get_last_job_timestamp_for_schedule(schedule_id):
    return redis_client.get(schedule_id)


def set_last_job_timestamp_for_schedule(schedule_id, timestamp):
    return redis_client.set(schedule_id, timestamp)


def get_next_runs(cron_expr, count, start_time=None):
    if start_time is None:
        start_time = datetime.now()

    cron = croniter(cron_expr, start_time)
    return [cron.get_next(datetime) for _ in range(count)]


def schedule_jobs():
    logging.info("Scheduling jobs...")
    schedules = schedule_client.ListSchedules(Empty()).schedules
    for schedule in schedules:
        lock_key = f"schedule_lock:{schedule.id}"
        logging.info(f"Processing schedule {schedule.id}...")
        if acquire_lock(lock_key):
            try:
                queuedJobs = job_client.ListJobs(ListJobsRequest(
                    schedule_id=schedule.id, status="QUEUED")).jobs
            except Exception as e:
                logging.error(f"An error occurred: {e}")
            finally:
                last_timestamp = get_last_job_timestamp_for_schedule(
                    schedule.id)

                # If two jobs are already queued, skip
                if len(queuedJobs) < MAX_QUEUE_SIZE:
                    next_runs = get_next_runs(
                        schedule.crontab, (MAX_QUEUE_SIZE - len(queuedJobs)), last_timestamp)
                    logging.info(f"Next runs: {next_runs}")

                    # TODO: Queue the next runs
                release_lock(lock_key)
        logging.info(f"Processed schedule {schedule.id}...")


@app.task()
def process_job(job_id):
    logging.info(f"Processing job {job_id}...")
    job = job_client.GetJob(GetJobRequest(id=job_id))
    lock_key = f"job_lock:{job.id}"
    if acquire_lock(lock_key, expiry=3600):  # Ensure no duplicate execution
        try:
            job_client.UpdateJob(UpdateJobRequest(
                job_id=job.id, status="RUNNING", started_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
            logging.info(f"Job {job.id} started execution.")

            command = job.payload.command_script
            params = list(job.payload.command_script_params)
            result = subprocess.run(["bash", "-c", command, "--"] +
                                    params, capture_output=True, text=True)

            if result.returncode == 0:
                job_client.UpdateJob(UpdateJobRequest(job_id=job.id, status="COMPLETED",
                                     result=result.stdout, finished_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
                logging.info(f"Job {job.id} completed successfully.")
            else:
                job_client.UpdateJob(UpdateJobRequest(job_id=job.id, status="FAILED",
                                     error=result.stderr, finished_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
                logging.error(
                    f"Job {job.id} failed with error: {result.stderr}")
        finally:
            release_lock(lock_key)


if __name__ == "__main__":
    logging.info("Scheduler service started.")
    while True:
        schedule_jobs()
        time.sleep(10)  # Run every 10s
