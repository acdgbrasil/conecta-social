import { Router } from "express";
import { AuthController } from "../../useCase/controllers/authController";
import { CustomError } from "../../infra/error/error";

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/auth/login', async (req, res) => {
    try{
        const {email,pass} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!pass) throw new CustomError('Bad Request',400,'Bad Request','Password is required');
        const authController = new AuthController();
        const response = await authController.login(email,pass);
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }

    }
});

authRouter.post('/auth/forgot/password', async (req, res) => {
    try{
        const {email} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        const authController = new AuthController();
        const response = await authController.forgotPassword(email);
        return res.status(200).json({code:response});
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
});

export default authRouter;