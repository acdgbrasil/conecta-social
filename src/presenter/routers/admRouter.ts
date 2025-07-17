import { response, Router } from "express";
import { CustomError } from "../../infra/error/error.ts";
import { AdmController } from "../../useCase/controllers/admController.ts";

const admRouter = Router();

const admController = new AdmController()

admRouter.get('/adm/list/all/:admEmail',async (req,res)=>{
    try{
        const {admEmail} = req.params
        const superAdmEmail = process.env.SUPER_ADM_EMAIL
        const isSuperAd = superAdmEmail === admEmail
        if(!isSuperAd){
            throw new CustomError('Unauthorized',401,'Unauthorized','Your access is denied, because you are not allowed');
        }
        
        const users = await admController.listAllUsers()
        return res.status(200).json({response:users})
    
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

admRouter.patch('/adm/deactivate/user',async(req,res)=>{
    try{
        const {admEmail,email} = req.body
        const superAdmEmail = process.env.SUPER_ADM_EMAIL
        const isSuperAd = superAdmEmail === admEmail
        if(!isSuperAd){
            throw new CustomError('Unauthorized',401,'Unauthorized','Your access is denied, because you are not allowed');
        }
        
        const hasSuccesfull = await admController.deactivateUser(email)
        if(hasSuccesfull) return res.status(200).json({"message": "User has been successfully deactivated!"})
        return res.status(200).json({"message": "Failed to deactivate user!"})
    
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

export default admRouter;