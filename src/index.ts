import express from 'express';
import { DatabaseService } from './infra/database/databaseService';
import { CustomError } from './infra/error/error';
import { SmtpService } from './infra/smtp/smtpService';
import { User } from './domain/entity/user';
import { UserController } from './useCase/controllers/userController';
const app = express();

app.get('/',async function(req,res){
    try{
        const db = new DatabaseService();
        const user = await db.findByEmail('gaderaldo10@gmail.com')
        res.status(200).json(user);
    }catch(e){{
        if(e instanceof CustomError){
            return res.status(e.statusCode).json(e.toJson(e.message));
        }
        return res.status(500).send('Internal Server Error');
    }
}
});

app.listen(3000,function(){
    console.log('Server is running on port 3000');
})