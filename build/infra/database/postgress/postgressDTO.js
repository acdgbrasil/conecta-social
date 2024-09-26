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
exports.createADM = createADM;
exports.create = create;
exports.findByEmail = findByEmail;
exports.listAllUsers = listAllUsers;
exports.deactivateUser = deactivateUser;
exports.changePassword = changePassword;
const client_1 = require("@prisma/client");
const user_1 = require("../../../domain/entity/user");
const prisma = new client_1.PrismaClient();
function createADM(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = yield prisma.user.create({
                data: {
                    fullName: user.fullName,
                    email: user.email,
                    password: user.password,
                    crm: user.crm,
                    role: client_1.UserRole.admin,
                }
            });
            return new user_1.User(newUser.id, newUser.fullName, newUser.email, newUser.password, newUser.crm, newUser.role.valueOf(), newUser.createdAt, newUser.updatedAt, true);
        }
        catch (e) {
            throw e;
        }
    });
}
function create(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = yield prisma.user.create({
                data: {
                    fullName: user.fullName,
                    email: user.email,
                    password: user.password,
                    crm: user.crm,
                    role: client_1.UserRole.user,
                }
            });
            return new user_1.User(newUser.id, newUser.fullName, newUser.email, newUser.password, newUser.crm, newUser.role.valueOf(), newUser.createdAt, newUser.updatedAt, newUser.isActive);
        }
        catch (e) {
            throw e;
        }
    });
}
function findByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findUnique({ where: { email } });
            if (user === null) {
                return false;
            }
            const newUser = new user_1.User(user.id, user.fullName, user.email, user.password, user.crm, user.role.valueOf(), user.createdAt, user.updatedAt, user.isActive);
            return newUser;
        }
        catch (e) {
            throw e;
        }
    });
}
function listAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield prisma.user.findMany();
            const usersTransition = [];
            for (var user of users) {
                const newUser = new user_1.User(user.id, user.fullName, user.email, user.password, user.crm, user.role, user.createdAt, user.updatedAt, user.isActive);
                usersTransition.push(newUser);
            }
            return usersTransition;
        }
        catch (e) {
            throw e;
        }
    });
}
function deactivateUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.update({
                where: { email },
                data: {
                    isActive: false
                }
            });
            return user;
        }
        catch (err) {
            throw err;
        }
    });
}
function changePassword(email, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.update({
                where: { email },
                data: {
                    password: newPassword
                }
            });
            return user;
        }
        catch (e) {
            throw e;
        }
    });
}
