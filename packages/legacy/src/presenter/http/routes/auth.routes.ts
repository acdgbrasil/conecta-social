import { Router } from "express";
import { AuthController } from "../../../useCase/controllers/authController.ts";
import { CustomError } from "../../../infra/error/error.ts";
import { UserController } from "../../../useCase/controllers/userController.ts";
import { User, UserRole } from "../../../domain/entity/user.ts";


const authRouter = Router();
const authController = new AuthController();
const userController = new UserController();

authRouter.post('/auth/register', async (req, res) => {
    try{
        const {name,email,pass} = req.body;
        if(!name) throw new CustomError('Bad Request',400,'Bad Request','Name is required');
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!pass) throw new CustomError('Bad Request',400,'Bad Request','Password is required');
        const user = new User(0,"Gabriel Vieiera Soriano Aderaldo","gaderaldo10@gmail.com","tomate98",null,UserRole.admin.toString(),new Date,new Date(),true);
        const response = await userController.create(user,true);
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }
    }
});

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
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }

    }
});

authRouter.post('/auth/forgot/password', async (req, res) => {
    try{
        const {email} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        const passToken = await authController.forgotPassword(email);
        return res.status(200).json({message:"Code sent to user email",emailToken:passToken});
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
        const {email,code,newPassword,emailToken} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!code) throw new CustomError('Bad Request',400,'Bad Request','Code is required');
        if(!newPassword) throw new CustomError('Bad Request',400,'Bad Request','New password is required');
        if(!emailToken) throw new CustomError('Bad Request',400,'Bad Request','Email token is required');
        const response = await authController.resetPassword(email,code,newPassword,emailToken);
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }
    }
});

export default authRouter;
