import { DomainError } from "../../../shared/erros-pattern/DomainError";
import { err, ok, Result } from "../../../shared/result-pattern/Result";
import { DE } from "../err/Diagnosis.error";
import { ICDCode } from "../value-objects/icdCode.valueObject";

export class Diagnosis {
    private constructor(readonly id:string, readonly date:Date, readonly description:string) {}

    static create(id:string,date:Date, description:string): Result<Diagnosis,DomainError>  {
        const idResult = ICDCode.createFromString(id);
        if(idResult.isErr) err(idResult.error);
        if (date.getTime() > new Date().getTime()) err(DE.DateInFuture(date, new Date()));
        if (date.getFullYear() < date.getFullYear()) err(DE.DateBeforeYearZero(date.getFullYear()));
        if (!description || description.trim().length === 0) err(DE.DescriptionEmpty(description));
        
        return ok(new Diagnosis(idResult.unwrap(),date,description));
    }
}
