import { Router } from "express"
import { validateFields } from "../middlewares"
import { EntidadController } from "../controllers"
import { EntidadValidator } from "../validators"

const router = Router()
const entidadController = new EntidadController()
const entidadValidator = new EntidadValidator()

router.get("/", entidadController.all)
router.get("/:id", entidadController.one)
router.post(
  "/",
  entidadValidator.validateEntidad,
  entidadValidator.validateIfNameIsUse,
  validateFields,
  entidadController.create,
)
router.put(
  "/:id",
  entidadValidator.validateEntidad,
  entidadValidator.validateIfIdExist,
  entidadValidator.validateIfNameIsUse,
  validateFields,
  entidadController.update,
)
router.delete("/:id", entidadController.delete)

// Exportación nombrada para resolver el error
export const entidadRoutes = router

// Exportación por defecto para mantener consistencia
export default router
