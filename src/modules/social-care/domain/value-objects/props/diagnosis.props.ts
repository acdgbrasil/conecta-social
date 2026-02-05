import type { ICDCode } from "../icdCode.valueObject";
import type { Timestamp } from "../timestamp.valueObject";

export type DiagnosisProps = {
  id: ICDCode;
  date: Timestamp;
  description: string;
};
