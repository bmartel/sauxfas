import { Destroy, Get, Head, Post, Put } from "./request";

export interface Manager<T> {
  read: Get<T>;
  create: Put<T> | Post<T>;
  update: Put<T>;
  destroy: Destroy<T>;
}

export type ManagerWithMetaRead<T> = Omit<Manager<T>, "read"> & {
  read: Get<T> | Head<T>;
};

