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

    async createReminderService(reminderData: {userId: number, title: string, description: string, due_date?: Date}) {
        const reminder = await prisma.reminder.create({
            data: {
                title: reminderData.title,
                description: reminderData.description,
                due_date: reminderData.due_date ?? null,
                user: {
                    connect: { id: reminderData.userId }
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
}

export const studentService = new StudentService()