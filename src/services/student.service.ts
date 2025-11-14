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
        if (lembretes) {
            for (const [key, lembrete] of Object.entries(lembretes)) {
                const title = lembrete.titulo
                const description = lembrete.descricao
                const date = lembrete.data
                this.createReminderService(userId, lembrete)
            }
        }
        this.createSummaryService(topicId, summary)
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

}

export const studentService = new StudentService()