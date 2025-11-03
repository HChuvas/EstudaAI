import type { NextFunction, Request, Response } from "express"
import { CreateUserRequestSchema } from "../schemas/UsersRequestSchema.js"
import { studentService } from "../services/student.service.js"
import { userService } from "../services/user.service.js"

export const registerStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = CreateUserRequestSchema.parse(req.body)
        const newStudent = await studentService.registerService(body)
        res.status(201).json(newStudent)
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        const user = await userService.loginService(email, password)
        const acessToken = await userService.getAcessToken(user.id, user.role)
        const userId = user.id
        const userRole = user.role
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            acessToken
          })
        
    } catch (error) {
        next(error) 
    }
}