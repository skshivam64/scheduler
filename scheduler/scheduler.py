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


def schedule_jobs():
    logging.info("Scheduling jobs...")
    schedules = schedule_client.ListSchedules(Empty()).schedules
    for schedule in schedules:
        lock_key = f"schedule_lock:{schedule.id}"
        logging.info(f"Processing schedule {schedule.id}...")
        if acquire_lock(lock_key):
            try:
                jobs = job_client.ListJobs(ListJobsRequest(
                    schedule_id=schedule.id, status="QUEUED")).jobs
                if len(jobs) < 2:
                    for _ in range(2 - len(jobs)):
                        scheduled_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                        # Rather than current time, parse the crontab to get the schedule
                        # for the next job
                        job = job_client.CreateJob(CreateJobRequest(
                            schedule_id=schedule.id, scheduled_for=scheduled_time))
                        logging.info(
                            f"Queued a new job {job.id} for schedule {schedule.id} at {scheduled_time}")
                        # TODO: Rather than calling delay, ask celery to schedule the job
                        # for job.scheduled_for
                        process_job.delay(job.id)
            finally:
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
