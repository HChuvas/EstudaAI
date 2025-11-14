import express from "express"

import { createReminder, createSubject, getAISummaryAndReminders, getReminders, getSubjects, registerStudent } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const studentRouter = express.Router();

studentRouter.post("/register", registerStudent);
studentRouter.get("/reminders", authMiddleware, getReminders)
studentRouter.post("/reminders/create", authMiddleware, createReminder)
studentRouter.post("/subjects/create", authMiddleware, createSubject)
studentRouter.get("/subjects", authMiddleware, getSubjects)
studentRouter.get("/llm/generate", authMiddleware, getAISummaryAndReminders)

export default studentRouter