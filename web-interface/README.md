Simple gRPC server and client code.

Steps:

1. Run the following commands to init a node project and install
   the dependencies.
   npm init -y
   npm install --save @grpc/grpc-js @grpc/proto-loader
   npm install --save-dev typescript ts-node @types/node

2. Generate ts-config.json.
   npx tsc --init

3. Modify ts-config.json.
   {
   "compilerOptions": {
   "target": "ES6",
   "module": "CommonJS",
   "esModuleInterop": true,
   "resolveJsonModule": true,
   "strict": true
   }
   }

4. Start the gRPC server.
   npx ts-node server.ts

5. Start the gRPC client.s
   npx ts-node client.ts
