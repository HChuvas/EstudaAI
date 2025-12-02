import express from "express"

import { createReminder, createStudyPlan, createSubject, createTopic, deleteMaterial, deleteReminder, deleteStudyPlan, deleteTopic, editChecklistItem, editReminder, getAISummaryAndReminders, getReminders, getStudyPlan, getStudyPlans, getSubjects, getSubjectTopics, markChecklistItem, registerStudent, sendMaterialsToLLMAndSaveTranscripts, sendTranscriptsForStudyPlan, topicMaterials, topicSummaries, uploadMaterials } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";
import { upload } from "../config/multer.js";
import { processChunksAndEmbeddings } from "../controllers/chunks.controller.js";

const studentRouter = express.Router();

studentRouter.post("/register", registerStudent);
studentRouter.get("/reminders", authMiddleware, getReminders)
studentRouter.post("/reminders/create", authMiddleware, createReminder)
studentRouter.delete("/reminders/delete", authMiddleware, deleteReminder)
studentRouter.put("/reminders/edit", authMiddleware, editReminder)
studentRouter.post("/subjects/create", authMiddleware, createSubject)
studentRouter.get("/subjects", authMiddleware, getSubjects)
studentRouter.post("/llm/generate", authMiddleware, getAISummaryAndReminders)
studentRouter.post("/materials/upload", authMiddleware, upload.array("files"), uploadMaterials)
studentRouter.delete("/materials/delete", authMiddleware, deleteMaterial)
studentRouter.post("/llm/materials/send", authMiddleware, sendMaterialsToLLMAndSaveTranscripts)
studentRouter.post("/llm/transcripts/send", authMiddleware, sendTranscriptsForStudyPlan)
studentRouter.get("/subjects/topics", authMiddleware, getSubjectTopics)
studentRouter.post("/studyplans/create", authMiddleware, createStudyPlan)
studentRouter.delete("/studyplans/delete", authMiddleware, deleteStudyPlan)
studentRouter.post("/topics/create", authMiddleware, createTopic)
studentRouter.delete("/topics/delete", authMiddleware, deleteTopic)
studentRouter.get("/studyplans", authMiddleware, getStudyPlans)
studentRouter.get("/studyplan", authMiddleware, getStudyPlan)
studentRouter.put("/studyplan/checklist/edit", authMiddleware, editChecklistItem)
studentRouter.put("/studyplan/checklist/mark", authMiddleware, markChecklistItem)
studentRouter.post("/llm/embed", authMiddleware, processChunksAndEmbeddings)
// add checklist item
// topic transcripts
studentRouter.get("/topic/materials", authMiddleware, topicMaterials)
studentRouter.get("/topic/summaries", authMiddleware, topicSummaries)
// topic summary
// chat
// load messages

export default studentRouter