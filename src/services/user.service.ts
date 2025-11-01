import { prisma } from "../database/index.js";
import type { Role } from "../types/roles.js";
import jwt from "jsonwebtoken"

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

    async register(body: { name: string; email: string; password: string; }) {
        const newUser = await prisma.user.create({
            data: body
        })
        return newUser
    }

    async getAcessToken(userId: number, role: Role) {
        const secret = process.env.ACCESS_TOKEN_SECRET
        if(!secret) throw new Error("ACCESS TOKEN NOT DEFINED")
        const acessToken = jwt.sign({id: userId, userRole: role}, secret, {expiresIn: "1h"})
    }
}

export const userService = new UserService()