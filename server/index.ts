import express from "express";
import dotenv from "dotenv";
import { connection } from "./config/database";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

connection();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
