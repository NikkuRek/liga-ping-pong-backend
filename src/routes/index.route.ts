import { Router } from "express"
import { CareerRoute } from "./career.routes"
import { EntidadRoute } from "./entidad.routes"
import { PlayerRoute } from "./player.routes"

const router = Router()

// // Rutas de la API
// router.use("/career", CareerRoutes)
// router.use("/entidad", entidadRoutes)

// export default router

export {
  CareerRoute,
  EntidadRoute,
  PlayerRoute,
  router,
}
