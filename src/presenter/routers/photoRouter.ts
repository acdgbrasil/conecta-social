import { Router } from "express";
import { UserController } from "../../useCase/controllers/userController";
import { CustomError } from "../../infra/error/error";

const photoRouter = Router();
const userControle = new UserController();

photoRouter.get('/photo/family/:id',async (req,res)=>{
    try {
        const {id} = req.params;
        const photo = await userControle.getPersonReferencePhoto(id);
        if(!photo){
            const error = new CustomError('Not Found',404,'Not Found','Photo not found');
            return res.status(404).json(error.toJson('Photo not found'));
        }
        const buffer = photo.fileBuffer;
        const extension = photo.fileExtension;
        
        res.set('Content-Type',`image/${extension}`);
        res.send(buffer);
        
    } catch (e) {
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

export default photoRouter;