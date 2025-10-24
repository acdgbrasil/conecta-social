import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { DE } from "../err/Diagnosis.error";
import { ICDCodeClass } from "./icdCode.valueObject";

export class Diagnosis {
    private constructor(readonly id:string, readonly date:Date, readonly description:string) {}

    static create(id:string,date:Date, description:string): Result<Diagnosis,DomainError>  {
        const idResult = ICDCodeClass.createFromString(id);
        if(idResult.isErr) err(idResult.error);
        if (date.getTime() > new Date().getTime()) err(DE.DateInFuture(date, new Date()));
        if (date.getFullYear() < date.getFullYear()) err(DE.DateBeforeYearZero(date.getFullYear()));
        if (!description || description.trim().length === 0) err(DE.DescriptionEmpty(description));
        
        return ok(Object.freeze(new Diagnosis(idResult.unwrap(),date,description)));
    }
}
