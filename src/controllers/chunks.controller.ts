import type { Request, Response, NextFunction } from "express";
import { chunkService } from "../services/chunking.service.js";
import axios from "axios";
import { studentService } from "../services/student.service.js";

export const processChunksAndEmbeddings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const topicId = Number(req.body.topicId);
        if (!topicId) throw new Error("topicId é obrigatório");

        const result = await chunkService.processTranscripts(topicId);

        res.status(200).json({
            message: "Chunks e embeddings gerados com sucesso",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


export const getRelevantChunks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const message = req.body.message;
        const topicId = Number(req.body.topicId)
        const userId = Number(req.auth?.id)
        if (!message) throw new Error("message é obrigatório");

        const context = await chunkService.searchRelevantChunks(message, topicId)
        studentService.saveMessage(message, userId, topicId)
        const result = await axios.post("http://127.0.0.1:5000/chat", {
            message,
            context
        })
        studentService.saveMessage(result.data.resposta, null, topicId)
        res.status(200).json(result.data);
    } catch (error) {
        next(error);
    }
};