import { Router } from "express";
import { UserController } from "../../useCase/controllers/userController";
import { CustomError } from "../../infra/error/error";
import { User } from "../../domain/entity/user";

const admRouter = Router();
const userControle = new UserController();

admRouter.post('/create/adm',async (req,res)=>{
    try{
        const {email,fullName,admEmail} = req.body;
        const superAdmEmail = process.env.SUPER_ADM_EMAIL;
        const isSuperAdm = superAdmEmail === admEmail;
        
        
        if(isSuperAdm){
            const error = new CustomError('Bad Request',400,'Bad Request','You are not allowed to create a new adm');
            return res.status(400).json(error.toJson('You are not allowed to create a new adm'));
        }

        if(!email){
            const error = new CustomError('Bad Request',400,'Bad Request','Email is required');
            return res.status(400).json(error.toJson('Email is required'));
        }
        if(!fullName){
            const error = new CustomError('Bad Request',400,'Bad Request','Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }

        console.log(admEmail);

        const newUser = new User(0,fullName,email,'Senh@123',null,'adm',new Date(),new Date());
        const user = await userControle.create(newUser,true);
        return res.status(201).json(user);

    }catch(e){
        return res.status(500).json(e);
    }
});

export default admRouter;