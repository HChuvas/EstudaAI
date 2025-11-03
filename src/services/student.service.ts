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
}

export const studentService = new StudentService()