import type { NextFunction, Request, Response } from "express"
import { CreateUserRequestSchema } from "../schemas/UsersRequestSchema.js"
import { userService } from "../services/user.service.js"

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = CreateUserRequestSchema.parse(req.body)
        const newUser = await userService.register(body)
        res.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        const user = await userService.login(email, password)
        const userId = user.id
        const userRole = user.role
        
        
    } catch (error) {
        
    }
}