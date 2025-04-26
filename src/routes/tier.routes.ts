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
  tierValidator.validateTier,
  tierValidator.validateIfNameIsUse,
  validateFields,
  tierController.create,
)
router.put(
  "/:id",
  tierValidator.validateTier,
  tierValidator.validateIfIdExist,
  tierValidator.validateIfNameIsUse,
  validateFields,
  tierController.update,
)
router.delete("/:id", tierController.delete)
 
export const TierRoute = router
 
export default router
