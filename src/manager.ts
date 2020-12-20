import { Destroy, Get, Head, Post, Put } from "./request";

export interface Manager<T> {
  read: Get<T> | Head<T>;
  create: Put<T> | Post<T>;
  update: Put<T> | Post<T>;
  destroy: Destroy<T>;
}
