import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
export const db = drizzle(
  "postgres://postgres:postgres@localhost:5432/demo_app",
  {
    schema: schema,
  }
);
