type SOME<T> = {
  readonly isSome: true;
  readonly isNone: false;
  readonly value: T;
};

type NONE = {
  readonly isSome: false;
  readonly isNone: true;
}

export type Option<T> = SOME<T> | NONE;

export const Some = <T>(value:T) : SOME<T> => ({isNone:false,isSome:true,value:value});

export const None = () : NONE => ({isNone:true,isSome:false});