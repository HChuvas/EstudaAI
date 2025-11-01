import type { RequestHandler } from "express"
import jwt from "jsonwebtoken"
import type { Role } from "../types/roles.js"

const secret = process.env.ACCESS_TOKEN_SECRET

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido" })
    return
  }

  const token = authHeader.split(" ")[1]

  try {
    if(!secret) throw new Error("ACCESS TOKEN NOT DEFINED")
    const decoded = jwt.verify(token, secret) as { id: number, userRole: Role }
    req.userId = decoded.id
    req.userRole = decoded.userRole
    next()
  } catch {
    res.status(401).json({ error: "Token inválido" })
  }
}