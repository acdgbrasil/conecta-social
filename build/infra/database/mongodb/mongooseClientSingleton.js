"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseClientSingleton = void 0;
class MongooseClientSingleton {
    constructor() { }
    static setInstance(instance) {
        if (!this.instance) {
            this.instance = instance;
        }
    }
    static get getInstance() {
        if (!this.instance) {
            throw new Error('MongooseClientSingleton is not initialized');
        }
        return this.instance;
    }
}
exports.MongooseClientSingleton = MongooseClientSingleton;
MongooseClientSingleton.instance = null;
