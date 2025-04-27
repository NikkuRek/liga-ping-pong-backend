import { HealthRoute } from './health.routes';
import { Router } from "express"
import { CareerRoute } from "./career.routes"
import { PlayerRoute } from "./player.routes"
import { TierRoute } from "./tier.routes"

const router = Router()

// // Rutas de la API
// router.use("/career", CareerRoutes)

// export default router

export {
  CareerRoute,
  PlayerRoute,
  TierRoute,
  HealthRoute,
  router,
}
