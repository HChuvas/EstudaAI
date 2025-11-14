import express from "express"
import cors from "cors"
import { router } from "./router.js"


const app = express()

app.use(express.json())
app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(router)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Servidor iniciado em http://localhost:${PORT}/`))