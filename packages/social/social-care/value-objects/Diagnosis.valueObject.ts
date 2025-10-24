import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { DE } from "../err/Diagnosis.error";
import { ICDCodeClass } from "./icdCode.valueObject";

export class Diagnosis {
    private constructor(readonly id:string, readonly date:Date, readonly description:string) {}

    static create(id:string,date:Date, description:string): Result<Diagnosis,DomainError>  {
        const idResult = ICDCodeClass.createFromString(id);
        if(idResult.isErr) return err(idResult.error);

        const now = new Date();
        if (date.getTime() > now.getTime()) return err(DE.DateInFuture(date, now));

        const year = date.getFullYear();
        if (year < 0) return err(DE.DateBeforeYearZero(year));

        if (!description || description.trim().length === 0) return err(DE.DescriptionEmpty(description));

        return ok(Object.freeze(new Diagnosis(idResult.unwrap(),date,description)));
    }
}
