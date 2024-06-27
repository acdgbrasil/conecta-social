import express from 'express';
import { DatabaseService } from './infra/database/databaseService';
import { CustomError } from './infra/error/error';
import { SmtpService } from './infra/smtp/smtpService';
const app = express();

app.get('/',async function(req,res){
    try{
        const smtp = new SmtpService();
        const result = await smtp.sendGenericEmail('noreply@acdgbrasil.com.br','gaderaldo10@gmail.com','Teste do SMTP','Teste do SMTP');
        if(!result) return res.status(500).send('error to send email');
        return res.status(200).send('Email sent');
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