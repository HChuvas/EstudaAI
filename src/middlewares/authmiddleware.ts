import { expressjwt } from "express-jwt"

export const authMiddleware = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET as string,
  algorithms: ["HS256"],
  requestProperty: "auth", // os dados do token ficam em req.auth
})
