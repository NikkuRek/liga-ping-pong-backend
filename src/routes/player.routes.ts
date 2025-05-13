import { Router } from "express"
import { validateFields } from "../middlewares"
import { PlayerController } from "../controllers"
import { PlayerValidator } from "../validators"

const router = Router()
const playerController = new PlayerController()
const playerValidator = new PlayerValidator()

router.get("/", playerController.all) // http://localhost:3000/api/player
router.get("/active", playerController.active) // http://localhost:3000/api/player/active
router.get("/inactive", playerController.inactive) // http://localhost:3000/api/player/inactive
router.get("/:CI", playerController.one) // http://localhost:3000/api/player/CI
router.post(
  "/",
  playerValidator.validateFields,
  playerValidator.validateCIExists,
  playerValidator.validatePhoneExists,
  validateFields,
  playerController.create,
) // http://localhost:3000/api/player

router.put(
  "/:CI",
  playerValidator.validateFields,
  playerValidator.validateCIExists,
  playerValidator.validatePhoneExists,
  validateFields,
  playerController.update,
) // http://localhost:3000/api/player/CI

router.delete("/:CI", playerController.softDelete) // http://localhost:3000/api/player/CI
router.delete("/delete/:CI", playerController.delete) // http://localhost:3000/api/player/delete/CI

export const PlayerRoute = router

export default router
