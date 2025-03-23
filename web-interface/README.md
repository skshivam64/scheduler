Simple gRPC server and client code.

Steps:

1. Start the gRPC server and database.
   docker compose up --build

2. Test the gRPC server using the ping service.
   grpcurl -plaintext -d '{"message": "Hello from gRPC!"}' localhost:50051 pingpong.PingPong/Ping

3. Create the database.
   docker exec -it database psql -U postgres -c "CREATE DATABASE scheduler_db;"

4. Install db-migrate.
   npm ibstall -g db-migrate

5. Create a database.json file in the root web-interface dir.
   A sample database.json is given for reference.

6. Create db migration.
   db-migrate create MIGRATION_NAME

7. Migrate up.
   db-migrate up

8. Migrate down.
   db-migrate down

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
   grpcurl -plaintext -d '{"command_name": "sum-two", "crontab": "0 0 \* \* \*", "params": ["3", "5"]}' localhost:50051 schedule.Schedule/CreateSchedule

9. List all schedules.
   grpcurl -plaintext localhost:50051 schedule.Schedule/ListSchedules

10. Delete a schedule.
    grpcurl -plaintext -d '{"id": 1}' localhost:50051 schedule.Schedule/DeleteSchedule

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
to start or are running alreadt, won't be affected but any new
job will not be scheduled with the command.
