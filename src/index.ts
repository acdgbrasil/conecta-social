import express from 'express';
import userRouter from './presenter/routers/userRouter';
import authRouter from './presenter/routers/authRouter';
const app = express();
const router = express.Router();
app.use(express.json());
app.use(router);
router.use('/api',userRouter);
router.use('/api',authRouter);



app.listen(3000,function(){
    console.log('Server is running on port 3000');
})