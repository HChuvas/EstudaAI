import express from "express"

import { createReminder, getReminders, registerStudent } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const studentRouter = express.Router();

studentRouter.post("/register", registerStudent);
studentRouter.get("/reminders", authMiddleware, getReminders)
studentRouter.post("/reminders/create", authMiddleware, createReminder)

export default studentRouter