import express from "express"

import { createReminder, createStudyPlan, createSubject, createTopic, deleteStudyPlan, getAISummaryAndReminders, getReminders, getStudyPlans, getSubjects, getSubjectTopics, registerStudent, sendMaterialsToLLMAndSaveTranscripts, sendTranscriptsForStudyPlan, uploadMaterials } from "../controllers/student.controller.js";
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
studentRouter.post("/llm/materials/send", authMiddleware, sendMaterialsToLLMAndSaveTranscripts)
studentRouter.post("/llm/transcripts/send", authMiddleware, sendTranscriptsForStudyPlan)
studentRouter.get("/subjects/topics", authMiddleware, getSubjectTopics)
studentRouter.post("/studyplans/create", authMiddleware, createStudyPlan)
studentRouter.delete("/studyplans/delete", authMiddleware, deleteStudyPlan)
studentRouter.post("/topics/create", authMiddleware, createTopic)
studentRouter.get("/studyplans", authMiddleware, getStudyPlans)

export default studentRouter