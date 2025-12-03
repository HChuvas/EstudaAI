import type { Request, Response, NextFunction } from "express";
import { chunkService } from "../services/chunking.service.js";
import axios from "axios";

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
        const topicId = req.body.topicId
        if (!message) throw new Error("message é obrigatório");

        const context = await chunkService.searchRelevantChunks(message, topicId)
        const result = await axios.post("http://127.0.0.1:5000/chat", {
            message,
            context
        })
        res.status(200).json(result.data);
    } catch (error) {
        next(error);
    }
};