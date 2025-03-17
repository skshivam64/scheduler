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

TODOs:

6. Data validation for each service.
7. Pagination for the list APIs.
