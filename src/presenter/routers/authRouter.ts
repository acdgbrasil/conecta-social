import { Router } from "express";
import { AuthController } from "../../useCase/controllers/authController";
import { CustomError } from "../../infra/error/error";
import { UserController } from "../../useCase/controllers/userController";
import { User } from "../../domain/entity/user";

const authRouter = Router();
const authController = new AuthController();
const userController = new UserController();

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

authRouter.post('/auth/reset/password', async (req, res) => {
    try{
        const {id,email,code,newPassword} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!code) throw new CustomError('Bad Request',400,'Bad Request','Code is required');
        if(!newPassword) throw new CustomError('Bad Request',400,'Bad Request','New password is required');
        if(!id) throw new CustomError('Bad Request',400,'Bad Request','id is required');
        const user = await userController.findByEmail(email) as User
        if(user.id != id) throw new CustomError('Bad Request',400,'Bad Request','The email that was requested for the change is different from the email that is in the body of the request');
        const response = await authController.resetPassword(email,code,newPassword);
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
});

export default authRouter;