import type { Request, Response, NextFunction } from "express";
import { chunkService } from "../services/chunking.service.js";

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
