import { Pool } from 'pg';

export const accessPool = new Pool({
  host: 'localhost',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: +process.env.POSTGRES_PORT_INSIDE,
  database: process.env.POSTGRES_ACCESS_DB,
});
