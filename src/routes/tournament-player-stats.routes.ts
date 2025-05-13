import { Router } from "express"
import { validateFields } from "../middlewares"
import { TournamentPlayerStatsController } from "../controllers"
import { tournamentPlayerStatsValidators } from "../validators"

const router = Router()
const tournamentPlayerStatsController = new TournamentPlayerStatsController()

router.get("/", tournamentPlayerStatsController.all) // http://localhost:3000/api/tournament-player-stats
router.get("/:id", tournamentPlayerStatsValidators.validateStatsIdExists, tournamentPlayerStatsController.one)
router.get("/player/:CI", tournamentPlayerStatsController.getByPlayer)
router.get("/tournament/:tournamentId", tournamentPlayerStatsController.getByTournament)
router.post(
  "/",
  tournamentPlayerStatsValidators.validateFields,
  tournamentPlayerStatsValidators.validateInscriptionExists,
  tournamentPlayerStatsValidators.validateUniqueStats,
  validateFields,
  tournamentPlayerStatsController.create,
)
router.put(
  "/:id",
  tournamentPlayerStatsValidators.validateFields,
  tournamentPlayerStatsValidators.validateStatsIdExists,
  tournamentPlayerStatsValidators.validateInscriptionExists,
  tournamentPlayerStatsValidators.validateUniqueStats,
  validateFields,
  tournamentPlayerStatsController.update,
)
router.delete("/:id", tournamentPlayerStatsValidators.validateStatsIdExists, tournamentPlayerStatsController.delete)

export const TournamentPlayerStatsRoute = router

export default router
