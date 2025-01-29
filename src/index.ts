import express from 'express';
import userRouter from './presenter/routers/userRouter';
import authRouter from './presenter/routers/authRouter';
import { connectionMongose, testConnection } from './infra/database/mongodb/mongoDtos/mongodbDto';
import { MongooseClientSingleton } from './infra/database/mongodb/mongooseClientSingleton';
import { verifyToken } from './infra/jwt/jwtToken';
import admRouter from './presenter/routers/admRouter';
import photoRouter from './presenter/routers/photoRouter';

const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
function startDatabase() {
    connectionMongose().then((client) => {
        MongooseClientSingleton.setInstance(client);
        testConnection();
    });
}

function verifyGetEnviroments(){
    if(process.env.DATABASE_URL == null || process.env.DATABASE_URL == undefined || process.env.DATABASE_URL == ''){
        return "FAIL TO LOAD DATABASE_URL";
    }

    if(process.env.SUPER_ADM_EMAIL == null || process.env.SUPER_ADM_EMAIL == undefined || process.env.SUPER_ADM_EMAIL == ''){
        return "FAIL TO LOAD SUPER_ADM_EMAIL";
    }

    return "ENVIRONMENT VARIABLES LOADED";
}

const app = express();
app.use(cors());
const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(router);
router.use('/api',authRouter);
router.use('/api/ping',async (_,res) => {
    res.send('pong');
});
router.use(verifyToken);
router.use('/api',photoRouter);
router.use('/api',userRouter);
router.use('/api',admRouter);



app.listen(PORT,function(){
    console.log('Server is running on port 3000');
    console.log(verifyGetEnviroments());
    startDatabase();
})