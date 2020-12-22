import {
  DestroyOptions,
  GetOptions,
  HeadOptions,
  OkResult,
  PostOptions,
  PutOptions,
} from "./request";

export interface Manager<T, V = any> {
  read<O = V, R = T>(
    options: GetOptions<O> | HeadOptions<O>
  ): Promise<OkResult<R>>;
  create<O = V, R = T>(
    options: PutOptions<O> | PostOptions<O> 
  ): Promise<OkResult<R>>;
  update<O = V, R = T>(
    options: PutOptions<O> | PostOptions<O> 
  ): Promise<OkResult<R>>;
  destroy<O = V, R = T>(
    options: DestroyOptions<O>
  ): Promise<OkResult<R>>;
}
