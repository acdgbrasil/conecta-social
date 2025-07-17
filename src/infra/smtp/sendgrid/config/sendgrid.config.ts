import sendGrid from '@sendgrid/mail'

export const sendGridConfig = (to:string,from:string,subject:string,text?:string,html?:string) => {
    sendGrid.setApiKey('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')
    const info = {
        to: to,
        from: from,
        subject: subject,
        text: text,
        html: html
    }
    return info
}