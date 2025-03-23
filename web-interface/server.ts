import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import dotenv from "dotenv";
import { addReflection } from "grpc-server-reflection";

import PingpongService from "./services/pingpong";
import CommandService from "./services/command";
import ScheduleService from "./services/schedule";

dotenv.config();

const PINGPONG_PROTO_PATH = path.join(__dirname, "proto/pingpong.proto");
const COMMAND_PROTO_PATH = path.join(__dirname, "proto/command.proto");
const SCHEDULE_PROTO_PATH = path.join(__dirname, "proto/schedule.proto");

const pingpongPkgDef = protoLoader.loadSync(PINGPONG_PROTO_PATH);
const commandPkgDef = protoLoader.loadSync(COMMAND_PROTO_PATH);
const schedulePkgDef = protoLoader.loadSync(SCHEDULE_PROTO_PATH);

const pingpongProto: any = grpc.loadPackageDefinition(pingpongPkgDef).pingpong;
const commandProto: any = grpc.loadPackageDefinition(commandPkgDef).command;
const scheduleProto: any = grpc.loadPackageDefinition(schedulePkgDef).schedule;

const server = new grpc.Server();

// Enable reflection
addReflection(server, "./descriptor_set.bin");

server.addService(pingpongProto.PingPong.service, PingpongService);
server.addService(commandProto.Command.service, CommandService);
server.addService(scheduleProto.Schedule.service, ScheduleService);

// Start the gRPC server
server.bindAsync(
    `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log(
            `🚀 gRPC Server running on port ${process.env.SERVER_PORT}`
        );
        server.start();
    }
);
