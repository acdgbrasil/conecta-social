import sendGrid from '@sendgrid/mail'
import { logError } from '../../../../utils/fancy_console_log';

export const sendGridConfig = (to:string,from:string,subject:string,text?:string,html?:string) => {
    if (!process.env.SEND_GRID_API_KEY) {
        logError('SEND_GRID_API_KEY is not defined in environment variables');
        throw new Error('SEND_GRID_API_KEY is not defined');
    }
    sendGrid.setApiKey(process.env.SEND_GRID_API_KEY);
    const info = {
        to: to,
        from: from,
        subject: subject,
        text: text,
        html: html
    }
    return info
}