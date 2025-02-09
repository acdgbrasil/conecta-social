import { Router } from "express";
import { AuthController } from "../../useCase/controllers/authController";
import { CustomError } from "../../infra/error/error";
import { UserController } from "../../useCase/controllers/userController";
import { User } from "../../domain/entity/user";


const authRouter = Router();
const authController = new AuthController();
const userController = new UserController();

authRouter.post('/auth/register', async (req, res) => {
    try{
        const {name,email,pass} = req.body;
        if(!name) throw new CustomError('Bad Request',400,'Bad Request','Name is required');
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!pass) throw new CustomError('Bad Request',400,'Bad Request','Password is required');
        const user = new User(0,"Gabriel Vieiera Soriano Aderaldo","gaderaldo10@gmail.com","tomate98",null,"admin",new Date,new Date(),true);
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
        const response = await authController.forgotPassword(email);
        return res.status(200).json({message:"Code sent to user email"});
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