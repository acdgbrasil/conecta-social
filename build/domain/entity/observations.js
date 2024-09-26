"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observations = void 0;
class Observations {
    constructor(observation, whoIsObservingId) {
        this.observation = observation;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.whoIsObservingId = whoIsObservingId;
    }
}
exports.Observations = Observations;
