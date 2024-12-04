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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter_1 = __importDefault(require("./presenter/routers/userRouter"));
const authRouter_1 = __importDefault(require("./presenter/routers/authRouter"));
const mongodbDto_1 = require("./infra/database/mongodb/mongoDtos/mongodbDto");
const mongooseClientSingleton_1 = require("./infra/database/mongodb/mongooseClientSingleton");
const jwtToken_1 = require("./infra/jwt/jwtToken");
const admRouter_1 = __importDefault(require("./presenter/routers/admRouter"));
const photoRouter_1 = __importDefault(require("./presenter/routers/photoRouter"));
const PORT = process.env.PORT || 3000;
function startDatabase() {
    (0, mongodbDto_1.connectionMongose)().then((client) => {
        mongooseClientSingleton_1.MongooseClientSingleton.setInstance(client);
        (0, mongodbDto_1.testConnection)();
    });
}
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(router);
router.use('/api', authRouter_1.default);
router.use('/api/ping', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('pong');
}));
router.use(jwtToken_1.verifyToken);
router.use('/api', photoRouter_1.default);
router.use('/api', userRouter_1.default);
router.use('/api', admRouter_1.default);
app.listen(PORT, function () {
    console.log('Server is running on port 3000');
    startDatabase();
});
