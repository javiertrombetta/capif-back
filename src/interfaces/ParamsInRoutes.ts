import { ParamsDictionary } from 'express-serve-static-core';

export interface ParamsWithId extends ParamsDictionary {
  id: string;
}
