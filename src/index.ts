import express from 'express';
import userRouter from './presenter/routers/userRouter';
import authRouter from './presenter/routers/authRouter';
import { connectionMongose, testConnection } from './infra/database/mongodb/mongoDtos/mongodbDto';
import { MongooseClientSingleton } from './infra/database/mongodb/mongooseClientSingleton';
import { verifyToken } from './infra/jwt/jwtToken';
import admRouter from './presenter/routers/admRouter';


const PORT = process.env.PORT || 3000;
function startDatabase() {
    connectionMongose().then((client) => {
        MongooseClientSingleton.setInstance(client);
        testConnection();
    });
}

const app = express();
const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(router);
router.use('/api',authRouter);
router.use('/api/ping',(_,res) => {
    res.send("PONG!!!");
});
router.use(verifyToken);
router.use('/api',userRouter);
router.use('/api',admRouter);




app.listen(PORT,function(){
    console.log('Server is running on port 3000');
    startDatabase();
})