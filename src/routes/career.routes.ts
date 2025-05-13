import { Router } from "express"
import { validateFields } from "../middlewares"
import { CareerController } from "../controllers"
import { CareerValidator } from "../validators"

const router = Router()
const careerController = new CareerController()
const careerValidator = new CareerValidator()

router.get("/", careerController.all) // http://localhost:3000/api/career
router.get("/:id", careerController.one)
router.post(
  "/",
  careerValidator.validateFields,
  careerValidator.validateIdExists,
  careerValidator.validateNameExists,
  validateFields,
  careerController.create,
)
router.put(
  "/:id",
  careerValidator.validateFields,
  careerValidator.validateIdExists,
  careerValidator.validateNameExists,
  validateFields,
  careerController.update,
)
router.delete("/:id", careerController.delete)

export const CareerRoute = router

export default router
