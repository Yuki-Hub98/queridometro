import { DataSource } from "typeorm";
import dotenv from 'dotenv';

dotenv.config();

export const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  entities: [process.env.NODE_ENV === "prod" 
      ? "dist/entities/*.js" 
      : "src/entities/*.ts"],
  logging: true,
  synchronize: true,
  ssl:
    process.env.NODE_ENV === "prod"
      ? { rejectUnauthorized: false }
      : false,

})