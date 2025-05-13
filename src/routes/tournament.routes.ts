import { Router } from "express"
import { validateFields } from "../middlewares"
import { TournamentController } from "../controllers"
import { TournamentValidator } from "../validators"

const router = Router()
const tournamentController = new TournamentController()
const tournamentValidator = new TournamentValidator()

router.get("/", tournamentController.all) // http://localhost:3000/api/tournament
router.get("/:id", tournamentValidator.validateTournamentIdExists, tournamentController.one)
router.post(
  "/",
  tournamentValidator.validateFields,
  tournamentValidator.validateTournamentNameUnique,
  validateFields,
  tournamentController.create,
)
router.put(
  "/:id",
  tournamentValidator.validateFields,
  tournamentValidator.validateTournamentIdExists,
  tournamentValidator.validateTournamentNameUnique,
  validateFields,
  tournamentController.update,
)
router.delete("/:id", tournamentValidator.validateTournamentIdExists, tournamentController.delete)

export const TournamentRoute = router

export default router
