// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\routes\team-inscription.routes.ts
import { Router } from "express"
import { validateFields } from "../middlewares"
import { TeamInscriptionController } from "../controllers/team-inscription.controller"
import { TeamInscriptionValidator } from "../validators/team-inscription.validators"

const router = Router()
const teamInscriptionController = new TeamInscriptionController()
const teamInscriptionValidator = new TeamInscriptionValidator()

router.get("/", teamInscriptionController.all) // http://localhost:3000/api/team-inscription
router.get("/:id", teamInscriptionValidator.validateIdExists, teamInscriptionController.one)
router.get("/team/:teamId", teamInscriptionController.getByTeam)
router.get("/tournament/:tournamentId", teamInscriptionController.getByTournament)
router.post(
  "/",
  teamInscriptionValidator.validateFields,
  teamInscriptionValidator.validateUniqueInscription,
  validateFields,
  teamInscriptionController.create,
)
router.put(
  "/:id",
  teamInscriptionValidator.validateFields,
  teamInscriptionValidator.validateIdExists,
  teamInscriptionValidator.validateUniqueInscription,
  validateFields,
  teamInscriptionController.update,
)
router.delete("/:id", teamInscriptionValidator.validateIdExists, teamInscriptionController.delete)

export const TeamInscriptionRoute = router

export default router
