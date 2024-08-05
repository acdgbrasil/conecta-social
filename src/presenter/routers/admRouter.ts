import { response, Router } from "express";
import { CustomError } from "../../infra/error/error";
import { AdmController } from "../../useCase/controllers/admController";

const admRouter = Router();

const admController = new AdmController()

admRouter.get('/adm/list/all/:admEmail',async (req,res)=>{
    try{
        const {admEmail} = req.params
        const superAdmEmail = process.env.SUPER_ADM_EMAIL
        const isSuperAd = superAdmEmail === admEmail
        if(!isSuperAd){
            throw new CustomError('Bad Request',401,'Bad Request','Your access is denied because, because your not allowed');
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
            throw new CustomError('Bad Request',401,'Bad Request','Your access is denied because, because your not allowed');
        }
        
        const hasSuccesfull = await admController.deactivateUser(email)
        return res.status(200).json({response:hasSuccesfull})
    
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

export default admRouter;