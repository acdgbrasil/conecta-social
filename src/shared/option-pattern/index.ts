import { Option as OptionNamespace } from "./Option";

export const Option = OptionNamespace;
export type { Some, None } from "./Option";
export type Option<T> = import("./Option").Option<T>;
