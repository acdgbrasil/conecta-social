export class CustomError extends Error {
    erroTitle:string;
    statusCode:number;
    name:string;
    message:string;
  
    constructor(errorType:string,statusCode:number,name:string,message:string) {
        super(message);
        this.erroTitle = errorType;
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
    }

    toJson(message:string){
      return {
        erroTitle: this.erroTitle,
        statusCode: this.statusCode,
        name: this.name,
        message: message
      }
    }
}