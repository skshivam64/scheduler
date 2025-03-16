import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// Load the protobuf file
const PROTO_PATH = path.join(__dirname, "proto/pingpong.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const pingpongProto: any =
    grpc.loadPackageDefinition(packageDefinition).pingpong;

// Create a gRPC client
const client = new pingpongProto.PingPong(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

// Send a ping request
const message = "Hello from gRPC!";
client.Ping({ message }, (error: any, response: any) => {
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Response:", response.message);
    }
});
