import express from "express"

import { createReminder, createSubject, getAISummaryAndReminders, getReminders, getSubjects, registerStudent, sendMaterialsToLLM, sendTranscriptsForStudyPlan, uploadMaterials } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";
import { upload } from "../config/multer.js";

const studentRouter = express.Router();

studentRouter.post("/register", registerStudent);
studentRouter.get("/reminders", authMiddleware, getReminders)
studentRouter.post("/reminders/create", authMiddleware, createReminder)
// reminders/delete
// reminder/edit
studentRouter.post("/subjects/create", authMiddleware, createSubject)
studentRouter.get("/subjects", authMiddleware, getSubjects)
studentRouter.post("/llm/generate", authMiddleware, getAISummaryAndReminders)
studentRouter.post("/materials/upload", authMiddleware, upload.array("files"), uploadMaterials)
studentRouter.post("/llm/materials/send", authMiddleware, sendMaterialsToLLM)
studentRouter.post("/studyplans/create", authMiddleware, sendTranscriptsForStudyPlan)

export default studentRouter