import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let dbConnection;

export async function connectToServer() {
  try {
    await client.connect();
    dbConnection = client.db();
    console.log("MongoDB Native Driver Connected Successfully");
  } catch (error) {
    console.log("Database Connection Failed: ", error);
    process.exit(1);
  }
}

export function getDb() {
  if (!dbConnection) {
    throw new Error("Database not initialized!");
  }
  return dbConnection;
}
