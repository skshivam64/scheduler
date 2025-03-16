import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// Load the protobuf file
const PROTO_PATH = path.join(__dirname, "proto/pingpong.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const pingpongProto: any =
    grpc.loadPackageDefinition(packageDefinition).pingpong;

// Implement the PingPong service
const server = new grpc.Server();

server.addService(pingpongProto.PingPong.service, {
    Ping: (call: any, callback: any) => {
        console.log("Received:", call.request.message);
        callback(null, { message: call.request.message });
    },
});

// Start the gRPC server
const PORT = "50051";
server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log(`🚀 gRPC Server running on port ${PORT}`);
        server.start();
    }
);
