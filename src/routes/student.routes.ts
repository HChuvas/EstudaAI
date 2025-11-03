import express from "express"

import { registerStudent } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const studentRouter = express.Router();

studentRouter.post("/register", registerStudent);

export default studentRouter