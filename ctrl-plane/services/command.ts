import * as grpc from "@grpc/grpc-js";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import CommandRepository from "../repositories/command";
import Joi from "joi";

const commandSchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        "string.base": "name must be a string",
        "string.empty": "name cannot be empty",
        "string.min": "name should have at least 1 character",
        "string.max": "name cannot exceed 255 characters",
        "any.required": "name is required",
    }),
    script: Joi.string().min(1).required().messages({
        "string.base": "script must be a string",
        "string.empty": "script cannot be empty",
        "string.min": "script should have at least 1 character",
        "any.required": "script is required",
    }),
});

const nameSchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        "string.base": "name must be a string",
        "string.empty": "name cannot be empty",
        "string.min": "name should have at least 1 character",
        "string.max": "name cannot exceed 255 characters",
        "any.required": "name is required",
    }),
});

const CommandService = {
    CreateCommand: async (call: any, callback: any) => {
        const { error } = commandSchema.validate(call.request);
        if (error) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: error.details[0].message,
            });
        }

        const { name, script } = call.request;
        try {
            // Check if the command already exists
            const exists = await CommandRepository.commandExists(name);
            if (exists) {
                return callback({
                    code: grpc.status.ALREADY_EXISTS,
                    message: "Command already exists!",
                });
            }

            await CommandRepository.createCommand(name, script);
            callback(null, new Empty());
        } catch (err) {
            callback(err);
        }
    },

    GetCommand: async (call: any, callback: any) => {
        const { error } = nameSchema.validate(call.request);
        if (error) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: error.details[0].message,
            });
        }

        const { name } = call.request;
        try {
            const command = await CommandRepository.getCommandByName(name);
            if (!command) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: "Command doesn't exist!",
                });
            }
            callback(null, command);
        } catch (err) {
            callback(err);
        }
    },

    UpdateCommand: async (call: any, callback: any) => {
        const { error } = commandSchema.validate(call.request);
        if (error) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: error.details[0].message,
            });
        }

        const { name, script } = call.request;
        try {
            const updated = await CommandRepository.updateCommand(name, script);
            if (!updated) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: "Command doesn't exist!",
                });
            }
            callback(null, new Empty());
        } catch (err) {
            callback(err);
        }
    },

    DeleteCommand: async (call: any, callback: any) => {
        const { error } = nameSchema.validate(call.request);
        if (error) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: error.details[0].message,
            });
        }

        const { name } = call.request;
        try {
            const deleted = await CommandRepository.deleteCommand(name);
            if (!deleted) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: "Command doesn't exist!",
                });
            }
            callback(null, new Empty());
        } catch (err) {
            callback(err);
        }
    },

    ListCommands: async (call: any, callback: any) => {
        try {
            const commands = await CommandRepository.listCommands();
            callback(null, { commands });
        } catch (err) {
            callback(err);
        }
    },
};

export default CommandService;
