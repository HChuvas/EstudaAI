import type { NextFunction, Request, Response } from "express"
import { CreateReminderSchema, CreateUserRequestSchema } from "../schemas/UsersRequestSchema.js"
import { studentService } from "../services/student.service.js"
import { userService } from "../services/user.service.js"
import { prisma } from "../database/index.js"

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

export const getReminders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.auth?.id)
        const userId = Number(req.auth?.id)
        console.log(userId)
        const reminders = await studentService.getRemindersService(userId)
        res.status(200).json(reminders)
    } catch (error) {
        next(error)
    }
}

export const createReminder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.auth?.id)
        const { title, description, due_date } = CreateReminderSchema.parse(req.body)
        const reminderData: { title: string; description: string; userId: number; due_date?: Date } = {
            title,
            description,
            userId,
          };
        if (due_date) {
            reminderData.due_date = new Date(due_date);
        }
        const reminder = await studentService.createReminderService(reminderData)
        res.status(201).json(reminder)
    } catch (error) {
        next(error)
    }
}

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.auth?.id)
        const { name } = req.body
        const subject = await studentService.createSubjectService(userId, name)
        res.status(201).json(subject)
    } catch (error) {
        next(error)
    }
}

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.auth?.id)
        const subjects = await studentService.getSubjectsService(userId)
        res.status(201).json(subjects)
    } catch (error) {
        next(error)
    }
}