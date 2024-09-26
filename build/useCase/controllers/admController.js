"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmController = void 0;
const databaseService_1 = require("../../infra/database/databaseService");
class AdmController {
    deactivateUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseService = new databaseService_1.DatabaseService();
                const users = yield databaseService.deactivateUser(email);
                return users;
            }
            catch (err) {
                throw err;
            }
        });
    }
    listAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseService = new databaseService_1.DatabaseService();
                const users = yield databaseService.listAllUsers();
                return users;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.AdmController = AdmController;
