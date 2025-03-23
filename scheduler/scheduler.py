import grpc
import os
import redis
import subprocess
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
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler(
                            "logs/scheduler.log"),
                        logging.StreamHandler()
                    ],)

# Celery configuration
app = Celery("scheduler", broker=os.getenv(
    "REDIS_URL", "redis://localhost:6379/0"))
redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"))


def get_grpc_client(service):
    channel = grpc.insecure_channel(
        os.getenv(
            "CTRL_PLANE_SERVER",
            "ctrl-plane:50051"))
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
        start_time = datetime.utcnow()

    cron = croniter(cron_expr, start_time)
    return [cron.get_next(datetime) for _ in range(count)]


def schedule_jobs():
    logging.debug("Scheduling jobs...")
    schedules = schedule_client.ListSchedules(Empty()).schedules
    for schedule in schedules:
        lock_key = f"schedule_lock:{schedule.id}"
        logging.debug(f"Processing schedule {schedule.id}...")
        if acquire_lock(lock_key):
            try:
                queuedJobs = job_client.ListJobs(ListJobsRequest(
                    schedule_id=schedule.id, status="QUEUED")).jobs

                # If two jobs are already queued, skip
                if len(queuedJobs) < MAX_QUEUE_SIZE:
                    last_timestamp = get_last_job_timestamp_for_schedule(
                        schedule.id)
                    if last_timestamp:
                        last_timestamp = last_timestamp.decode("utf-8")
                        last_timestamp = datetime.strptime(
                            last_timestamp, "%Y-%m-%d %H:%M:%S")
                    next_runs = get_next_runs(
                        schedule.crontab,
                        (MAX_QUEUE_SIZE - len(queuedJobs)), last_timestamp)
                    for next_expected_start_time in next_runs:
                        next_expected_start_time = next_expected_start_time.strftime(
                            '%Y-%m-%d %H:%M:%S')
                        job = job_client.CreateJob(CreateJobRequest(
                            schedule_id=schedule.id, scheduled_for=next_expected_start_time))
                        process_job.apply_async(
                            args=[job.id], eta=next_expected_start_time)
                        set_last_job_timestamp_for_schedule(
                            schedule.id, next_expected_start_time)
                        logging.info(
                            f"Scheduled job {job.id} for {next_expected_start_time}")

            except Exception as e:
                logging.error(f"An error occurred: {e}")
            finally:
                release_lock(lock_key)
        logging.debug(f"Processed schedule {schedule.id}...")


@app.task()
def process_job(job_id):
    logging.debug(f"Processing job {job_id}...")
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
