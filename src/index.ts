import express from 'express';
import { DatabaseService } from './infra/database/databaseService';
import { CustomError } from './infra/error/error';
const app = express();

app.get('/',async function(req,res){
    try{
        const databaseService = new DatabaseService();
        const user = await databaseService.findByEmail('gaderaldo10@gmail.com');
        console.log(user)
        res.send('Hello World');
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