import type { id } from "zod/locales";
import { supabase } from "../config/supabase.js";
import { prisma } from "../database/index.js";
import type { Role } from "../types/roles.js";
import jwt from "jsonwebtoken"

class StudentService {
    async registerService(body: { name: string; email: string; password: string; }) {
        const newUser = await prisma.user.create({
            data: body
        })

        const newStudent = await prisma.student.create({
            data: { user: {
                    connect: { id: newUser.id }
                },
            }
        })
        return newStudent
    }

    async getRemindersService(userId: number) {
        const reminders = await prisma.reminder.findMany({
            where: { userId }
        })
        return reminders
    }

    async createReminderService(userId: number, reminderData: Lembrete) {
        const reminder = await prisma.reminder.create({
            data: {
                title: reminderData.titulo,
                description: reminderData.descricao,
                due_date: reminderData.data ?? null,
                user: {
                    connect: { id: userId }
                }
            }
        })
        return reminder
    }

    async createSubjectService(userId: number, name: string) {
        const subject = await prisma.subject.create({
            data: {
                name,
                user: {
                    connect: { id: userId }
                }
            }
        })
        return subject
    }

    async getSubjectsService(userId: number) {
        const subjects = await prisma.subject.findMany({
            where: {
                userId
            }
        })

        return subjects
    }

    async processJSONService(userId: number, topicId: number, json: RespostaIA) {
        const summary = json.resumo
        const lembretes = json.lembretes
        const output = []    
        if (lembretes) {
            for (const [key, lembrete] of Object.entries(lembretes)) {
                const title = lembrete.titulo
                const description = lembrete.descricao
                const date = lembrete.data
                const newReminder = await this.createReminderService(userId, lembrete)
                output.push(newReminder)
            }
        }
        const newSummary = await this.createSummaryService(topicId, summary)
        return { output, newSummary }
    }

    async createSummaryService(topicId: number, summary: Resumo) {
        const newSummary = await prisma.summary.create({
            data: {
                title: summary.título,
                content: summary.conteúdo,
                topic: {
                    connect: { id: topicId }
                }
            }
        })

        return newSummary
    }


    async uploadMaterialsService(userId: number, topicId: number, files: Express.Multer.File[]) {
        const uploads = files.map(async (file) => {
            const path = `materials/${userId}/${topicId}/${Date.now()}-${file.originalname}`

            const { error } = await supabase.storage
            .from(`EstudaAI%20Files`)
            .upload(path, file.buffer, {
                contentType: file.mimetype
            })

            if (error) throw new Error("Erro no upload: " + error.message)

            const { data: publicUrlData } = supabase.storage
            .from("EstudaAI%20Files")
            .getPublicUrl(path)

            const newFile = await prisma.material.create({
                data: {
                    title: file.originalname,
                    file_type: file.mimetype,
                    file_path: publicUrlData.publicUrl,
                    topic: {
                        connect: { id: topicId }
                    },
                    user: {
                        connect: { id: userId }
                    }
                }
            })

            return newFile
        })

       return Promise.all(uploads)
    }

    async getTopicMaterials(topicId: number) {
        const materialUrls = await prisma.material.findMany({
            where: { topic_id: topicId },
            select: { file_path: true }
        })

        return materialUrls
    }

    async getTranscripts(topicIds: Array<number>) {
        return Promise.all(topicIds.map(async (id) => {
            return prisma.transcript.findMany({
                where: { material: { topic_id:  id } },
                select: { title: true, content: true }
            })
        }))
    }
}

export const studentService = new StudentService()