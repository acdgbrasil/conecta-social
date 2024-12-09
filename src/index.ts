import express from 'express';
import userRouter from './presenter/routers/userRouter';
import authRouter from './presenter/routers/authRouter';
import { connectionMongose, testConnection } from './infra/database/mongodb/mongoDtos/mongodbDto';
import { MongooseClientSingleton } from './infra/database/mongodb/mongooseClientSingleton';
import { verifyToken } from './infra/jwt/jwtToken';
import admRouter from './presenter/routers/admRouter';
import photoRouter from './presenter/routers/photoRouter';

const cors = require('cors');
const PORT = process.env.PORT || 3000;
function startDatabase() {
    connectionMongose().then((client) => {
        MongooseClientSingleton.setInstance(client);
        testConnection();
    });
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
    startDatabase();
})