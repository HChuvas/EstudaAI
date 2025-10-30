import * as userService from "../services/user.service.js"

export const create = async (req, res) => {
    try {
        // const body = CreateUserRequestSchema.parse(req.body)
        const body = req.body
        const newUser = await prisma.user.create({
            data: body
        })
        res.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
}