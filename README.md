Follow the following steps to set up the project:

1.  Make sure to have the desired env variables in .env and
    ctrl-plane/.env, please check .env.sample and
    ctrl-plane/.env.sample for reference.

2.  Start all services.
    docker compose up --build --detach

3.  Test the gRPC server using the ping service.
    grpcurl -plaintext -d '{"message": "Hello from gRPC!"}' localhost:50051 pingpong.PingPong/Ping

4.  Create the database.
    docker exec -it database psql -U postgres -c "CREATE DATABASE scheduler_db;"

5.  Database migration.
    db-migrate up --config ctrl-plane/database.json --migrations-dir ctrl-plane/migrations

Follow the following steps for a demo of the project:

1.  Create some data to work on.
    grpcurl -plaintext -d '{"name": "sum-two", "script": "echo $(( $1 + $2 ))"}' localhost:50051 command.Command/CreateCommand
    grpcurl -plaintext -d '{"name": "sum-three", "script": "echo $(( $1 + $2 + $3 ))"}' localhost:50051 command.Command/CreateCommand
    grpcurl -plaintext -d '{"name": "invalid", "script": "invalid"}' localhost:50051 command.Command/CreateCommand
    grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "*/2 * * * *", "params": ["3", "5"]}' localhost:50051 schedule.Schedule/CreateSchedule
    grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "*/3 * * * *", "params": ["5", "7"]}' localhost:50051 schedule.Schedule/CreateSchedule
    grpcurl -plaintext -d '{"command_name": "sum-three", "crontab": "*/5 * * * *", "params": ["3", "5", "7"]}' localhost:50051 schedule.Schedule/CreateSchedule
    grpcurl -plaintext -d '{"command_name": "invalid", "crontab": "*/7 * * * *"}' localhost:50051 schedule.Schedule/CreateSchedule
2.  Keep running the following to see all jobs.
    grpcurl -plaintext localhost:50051 job.Job/ListJobs

Other util commands:

1. Generate descriptor_set.bin.
   protoc -I ./proto --include_imports --descriptor_set_out=descriptor_set.bin ./proto/\*

2. List all gRPC services.
   grpcurl -plaintext localhost:50051 list

3. Example command to register a new command.
   grpcurl -plaintext -d '{"name": "sum-two", "script": "echo $(( $1 + $2 ))"}' localhost:50051 command.Command/CreateCommand

4. Example command to fetch a command.
   grpcurl -plaintext -d '{"name": "sum-two"}' localhost:50051 command.Command/GetCommand

5. Example command to update a command.
   grpcurl -plaintext -d '{"name": "sum-two", "script": "echo $(( $1 + $2 + 1 ))"}' localhost:50051 command.Command/UpdateCommand

6. Example command to delete a command.
   grpcurl -plaintext -d '{"name": "sum-two"}' localhost:50051 command.Command/DeleteCommand

7. Example command to list all commands.
   grpcurl -plaintext localhost:50051 command.Command/ListCommands

8. Create a schedule.
   grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "0 0 * * *", "params": ["3", "5"]}' localhost:50051 schedule.Schedule/CreateSchedule

9. List all schedules.
   grpcurl -plaintext localhost:50051 schedule.Schedule/ListSchedules

10. Delete a schedule.
    grpcurl -plaintext -d '{"id": 1}' localhost:50051 schedule.Schedule/DeleteSchedule

11. Create a job.
    grpcurl -plaintext -d '{ "schedule_id": 1, "scheduled_for": "2025-03-23T11:00:00Z"}' localhost:50051 job.Job/CreateJob

12. Get a job.
    grpcurl -plaintext -d '{ "id": 101 }' localhost:50051 job.Job/GetJob

13. List all jobs.
    grpcurl -plaintext localhost:50051 job.Job/ListJobs

14. List job by schedule id.
    grpcurl -plaintext -d '{ "schedule_id": 1 }' localhost:50051 job.Job/ListJobs

15. Get only queued jobs for a given schedule.
    grpcurl -plaintext -d '{ "schedule_id": 3, "status": "QUEUED" }' localhost:50051 job.Job/ListJobs

16. Update job.
    grpcurl -plaintext -d '{ "job_id": 101, "status": "RUNNING", "started_at": "2025-03-23T11:00:00Z" }' localhost:50051 job.Job/UpdateJob

17. Create db migration.
    db-migrate create MIGRATION_NAME

18. Migrate up.
    db-migrate up

19. Migrate down.
    db-migrate down

20. Generate python protobuf files.
    python -m grpc_tools.protoc -I=. --python_out=. --grpc_python_out=. schedule.proto
    python -m grpc_tools.protoc -I=. --python_out=. --grpc_python_out=. job.proto

TODOs:

1. Data validation for each service.
2. Pagination for the list APIs.
3. Unit tests.
4. API Gateway using Envoy or any other proxy to expose REST APIs.

Although, the service supports updating and removing command
but please note the following:

i) If the command is updated, jobs that are already scheduled
to start or are already running, won't be affected; they will
run the old command. Any new job will be scheduled with the
updated command.

ii) If the command is deleted, jobs that are already scheduled
to start or are already running, won't be affected but any new
job will not be scheduled with the command.
