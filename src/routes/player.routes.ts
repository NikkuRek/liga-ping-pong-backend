import { Router } from "express"
import { validateFields } from "../middlewares"
import { PlayerController } from "../controllers"
import { PlayerValidator } from "../validators"

const router = Router()
const playerController = new PlayerController()
const playerValidator = new PlayerValidator()

router.get("/", playerController.all) // http://localhost:3004/api/player
router.get("/active", playerController.active) // http://localhost:3004/api/player/active
router.get("/inactive", playerController.inactive) // http://localhost:3004/api/player/inactive
router.get("/:ci", playerController.one) // http://localhost:3004/api/player/ci
router.post(
  "/",
  playerValidator.validateFields,
  playerValidator.validateCIExists,
  playerValidator.validatePhoneExists,
  validateFields,
  playerController.create,
) // http://localhost:3004/api/player

router.put(
  "/:ci",
  playerValidator.validateFields,
  playerValidator.validateCIExists,
  playerValidator.validatePhoneExists,
  validateFields,
  playerController.update,
) // http://localhost:3004/api/player/ci

router.delete("/:ci", playerController.softDelete) // http://localhost:3004/api/player/ci
router.delete("/delete/:ci", playerController.delete) // http://localhost:3004/api/player/delete/ci

export const PlayerRoute = router

export default router
