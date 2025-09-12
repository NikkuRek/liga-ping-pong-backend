import { Router, type Request, type Response } from "express"
import { db } from "../config/sequelize.config"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
  try {
    await db.authenticate()
    res.status(200).json({ status: "ok", database: "connected" })
  } catch (error) {
    console.error("Health check failed: DB connection error", error)
    res.status(500).json({ status: "error", database: "disconnected" })
  }
})

export const HealthRoute = router
