import { prisma } from "./database/index.js"
import { Router } from "express"

const router = Router()

router.get("/users", async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
})

export { router }