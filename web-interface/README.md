Simple gRPC server and client code.

Steps:

1. Start the gRPC server and database.
   docker compose up --build

2. Test the gRPC server using the ping service.
   grpcurl -plaintext -d '{"message": "Hello from gRPC!"}' localhost:50051 pingpong.PingPong/Ping

3. Create the database.
   scheduler_db

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
