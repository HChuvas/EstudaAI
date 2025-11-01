import { prisma } from "../database/index.js";
import type { Role } from "../types/roles.js";


class UserService {
    async login(email: string, password: string) {
        const user = await prisma.user.findFirst({
            where: { email, password },
            include: {
                student: true,
                teacher: true
            }
        })

        if(!user) {
            throw new Error("Credenciais Inválidas")
        }

        let role: Role

        if(user.student) {
            role = "STUDENT"
        }

        if(user.teacher) {
            role = "TEACHER"
        }

        else{
            throw new Error("Unknown user type")
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role
        }
    }

    async register(body) {
        const newUser = await prisma.user.create({
            data: body
        })
        return newUser
    }
}

export const userService = new UserService()