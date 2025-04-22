import { Router } from "express"
import { CareerRoute } from "./career.routes"
import { PlayerRoute } from "./player.routes"

const router = Router()

// // Rutas de la API
// router.use("/career", CareerRoutes)

// export default router

export {
  CareerRoute,
  PlayerRoute,
  router,
}
