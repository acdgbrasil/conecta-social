import { SQL } from 'bun'

export const pg = new SQL({
  url: `postgres://${process.env.SC_DB_USER}:${process.env.SC_DB_PASSWORD}@localhost:5433/${process.env.SC_DB_NAME}`
});