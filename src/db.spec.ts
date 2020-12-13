import test from "ava";
import {db} from "./db";
//import { request, resolveRequest, resourceGroup } from "./spec.helper";

const baseUri = "http://localhost";

test("db: initializes with a base uri", (t) => {
  t.assert(db(baseUri));
});
