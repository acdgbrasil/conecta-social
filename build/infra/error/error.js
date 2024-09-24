"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
/**
 * Represents a custom error with additional properties.
 */
class CustomError extends Error {
    /**
     * Creates a new instance of the CustomError class.
     * @param errorType - The type of the error.
     * @param statusCode - The status code associated with the error.
     * @param name - The name of the error.
     * @param message - The error message.
     */
    constructor(errorType, statusCode, name, message) {
        super(message);
        this.erroTitle = errorType;
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
    }
    /**
     * Converts the error to a JSON object.
     * @param message - The custom error message.
     * @returns The error as a JSON object.
     */
    toJson(message) {
        return {
            erroTitle: this.erroTitle,
            statusCode: this.statusCode,
            name: this.name,
            message: message
        };
    }
}
exports.CustomError = CustomError;
