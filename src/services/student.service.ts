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
}

export const studentService = new StudentService()