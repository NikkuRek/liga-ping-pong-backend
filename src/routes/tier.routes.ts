import { Router } from "express"
import { validateFields } from "../middlewares"
import { TierController } from "../controllers"
import { TierValidator } from "../validators"

const router = Router()
const tierController = new TierController()
const tierValidator = new TierValidator()

router.get("/", tierController.all) // http://localhost:3000/api/tier
router.get("/:id", tierController.one)
router.post(
  "/",
  tierValidator.validateFields,
  tierValidator.validateNameExists,
  tierValidator.validateIdExists,
  validateFields,
  tierController.create,
)
router.put(
  "/:id",
  tierValidator.validateFields,
  tierValidator.validateIdExists,
  tierValidator.validateNameExists,
  validateFields,
  tierController.update,
)
router.delete("/:id", tierController.delete)

export const TierRoute = router

export default router
