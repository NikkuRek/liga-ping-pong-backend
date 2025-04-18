import { Router } from "express"

const router = Router()

// Rutas de la API
router.use("/entidad", entidadRoutes)

export {
  router,
}

export default router
