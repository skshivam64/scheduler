<h1>Scheduler</h1>
<h2>Setup Instructions</h2>

1.  Make sure to have the desired env variables in .env and
    ctrl-plane/.env, please check .env.sample and
    ctrl-plane/.env.sample for reference.

2.  Start all services.
    <pre><code>docker compose up --build --detach</code></pre>

3.  Test the gRPC server using the ping service.
    <pre><code>grpcurl -plaintext -d '{"message": "Hello from gRPC!"}' localhost:50051 pingpong.PingPong/Ping</code></pre>

4.  Create the database.
    <pre><code>docker exec -it database psql -U postgres -c "CREATE DATABASE scheduler_db;"</code></pre>

5.  Database migration.
    <pre><code>db-migrate up --config ctrl-plane/database.json --migrations-dir ctrl-plane/migrations</code></pre>

<h2>Demo</h2>

1.  Create some data to work on.
    <pre><code>grpcurl -plaintext -d '{"name": "sum-two", "script": "echo $(( $1 + $2 ))"}' localhost:50051 command.Command/CreateCommand
    grpcurl -plaintext -d '{"name": "sum-three", "script": "echo $(( $1 + $2 + $3 ))"}' localhost:50051 command.Command/CreateCommand
    grpcurl -plaintext -d '{"name": "invalid", "script": "invalid"}' localhost:50051 command.Command/CreateCommand
    grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "*/2 * * * *", "params": ["3", "5"]}' localhost:50051 schedule.Schedule/CreateSchedule
    grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "*/3 * * * *", "params": ["5", "7"]}' localhost:50051 schedule.Schedule/CreateSchedule
    grpcurl -plaintext -d '{"command_name": "sum-three", "crontab": "*/5 * * * *", "params": ["3", "5", "7"]}' localhost:50051 schedule.Schedule/CreateSchedule
    grpcurl -plaintext -d '{"command_name": "invalid", "crontab": "*/7 * * * *"}' localhost:50051 schedule.Schedule/CreateSchedule</code></pre>
2.  Keep running the following to see all jobs.
    <pre><code>grpcurl -plaintext localhost:50051 job.Job/ListJobs</code></pre>

<h2>Utility Commands</h2>

1. Generate descriptor_set.bin.
   <pre><code>protoc -I ./proto --include_imports --descriptor_set_out=descriptor_set.bin ./proto/*</code></pre>

2. List all gRPC services.
   <pre><code>grpcurl -plaintext localhost:50051 list</code></pre>

3. Example command to register a new command.
   <pre><code>grpcurl -plaintext -d '{"name": "sum-two", "script": "echo $(( $1 + $2 ))"}' localhost:50051 command.Command/CreateCommand</code></pre>

4. Example command to fetch a command.
   <pre><code>grpcurl -plaintext -d '{"name": "sum-two"}' localhost:50051 command.Command/GetCommand</code></pre>

5. Example command to update a command.
   <pre><code>grpcurl -plaintext -d '{"name": "sum-two", "script": "echo $(( $1 + $2 + 1 ))"}' localhost:50051 command.Command/UpdateCommand</code></pre>

6. Example command to delete a command.
   <pre><code>grpcurl -plaintext -d '{"name": "sum-two"}' localhost:50051 command.Command/DeleteCommand</code></pre>

7. Example command to list all commands.
   <pre><code>grpcurl -plaintext localhost:50051 command.Command/ListCommands</code></pre>

8. Create a schedule.
   <pre><code>grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "0 0 * * *", "params": ["3", "5"]}' localhost:50051 schedule.Schedule/CreateSchedule</code></pre>

9. List all schedules.
   <pre><code>grpcurl -plaintext localhost:50051 schedule.Schedule/ListSchedules</code></pre>

10. Delete a schedule.
    <pre><code>grpcurl -plaintext -d '{"id": 1}' localhost:50051 schedule.Schedule/DeleteSchedule</code></pre>

11. Create a job.
    <pre><code>grpcurl -plaintext -d '{ "schedule_id": 1, "scheduled_for": "2025-03-23T11:00:00Z"}' localhost:50051 job.Job/CreateJob</code></pre>

12. Get a job.
    <pre><code>grpcurl -plaintext -d '{ "id": 101 }' localhost:50051 job.Job/GetJob</code></pre>

13. List all jobs.
    <pre><code>grpcurl -plaintext localhost:50051 job.Job/ListJobs</code></pre>

14. List job by schedule id.
    <pre><code>grpcurl -plaintext -d '{ "schedule_id": 1 }' localhost:50051 job.Job/ListJobs</code></pre>

15. Get only queued jobs for a given schedule.
    <pre><code>grpcurl -plaintext -d '{ "schedule_id": 3, "status": "QUEUED" }' localhost:50051 job.Job/ListJobs</code></pre>

16. Update job.
    <pre><code>grpcurl -plaintext -d '{ "job_id": 101, "status": "RUNNING", "started_at": "2025-03-23T11:00:00Z" }' localhost:50051 job.Job/UpdateJob</code></pre>

17. Create db migration.
    <pre><code>db-migrate create MIGRATION_NAME</code></pre>

18. Migrate up.
    <pre><code>db-migrate up</code></pre>

19. Migrate down.
    <pre><code>db-migrate down</code></pre>

20. Generate python protobuf files.
    <pre><code>python -m grpc_tools.protoc -I=. --python_out=. --grpc_python_out=. schedule.proto
    python -m grpc_tools.protoc -I=. --python_out=. --grpc_python_out=. job.proto</code></pre>

<h2>TODOs</h2>

1. Data validation for each service.
2. Pagination for the list APIs.
3. Unit tests.
4. API Gateway using Envoy or any other proxy to expose REST APIs.

<h2>Important Notes</h2>
Although, the service supports updating and removing command
but please note the following:
<ul>
        <li>
If the command is updated, jobs that are already scheduled
to start or are already running, won't be affected; they will
run the old command. Any new job will be scheduled with the
updated command.
        </li>
        <li>
If the command is deleted, jobs that are already scheduled
to start or are already running, won't be affected but any new
job will not be scheduled with the command.
        </li>
        <li>
If a schedule (or crontab) is deleted, jobs that are already
scheduled to start or are already running, won't be affected
but any new job will not be scheduled for that schedule (or
crontab).
        </li>
</ul>
