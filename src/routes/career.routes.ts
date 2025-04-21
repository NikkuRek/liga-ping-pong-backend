import { Router } from "express"
import { validateFields } from "../middlewares"
import { CareerController } from "../controllers"
import { CareerValidator } from "../validators"

const router = Router()
const careerController = new CareerController()
const careerValidator = new CareerValidator()

router.get("/", careerController.all)
router.get("/:id", careerController.one)
router.post(
  "/",
  careerValidator.validateCareer,
  careerValidator.validateIfNameIsUse,
  validateFields,
  careerController.create,
)
router.put(
  "/:id",
  careerValidator.validateCareer,
  careerValidator.validateIfIdExist,
  careerValidator.validateIfNameIsUse,
  validateFields,
  careerController.update,
)
router.delete("/:id", careerController.delete)

// Exportación nombrada para resolver el error
export const CareerRoute = router

// Exportación por defecto para mantener consistencia
export default router
