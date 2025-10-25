import { ICDCode } from "../icdCode.valueObject";
import { Timestamp } from "../timestamp.valueObject";

export type DiagnosisProps = {
    id: ICDCode;
    date: Timestamp;
    description: string;
};
