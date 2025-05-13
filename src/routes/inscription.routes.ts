import { Router } from "express"
import { validateFields } from "../middlewares"
import { InscriptionController } from "../controllers"
import { InscriptionValidator } from "../validators"

const router = Router()
const inscriptionController = new InscriptionController()
const inscriptionValidator = new InscriptionValidator()

router.get("/", inscriptionController.all) // http://localhost:3000/api/inscription
router.get("/:id", inscriptionValidator.validateIdExists, inscriptionController.one)
router.get("/player/:CI", inscriptionController.getByPlayer)
router.get("/tournament/:tournamentId", inscriptionController.getByTournament)
router.post(
  "/",
  inscriptionValidator.validateFields,
  inscriptionValidator.validatePlayerAndTournamentExist,
  inscriptionValidator.validateUniqueInscription,
  validateFields,
  inscriptionController.create,
)
router.put(
  "/:id",
  inscriptionValidator.validateFields,
  inscriptionValidator.validateIdExists,
  inscriptionValidator.validatePlayerAndTournamentExist,
  inscriptionValidator.validateUniqueInscription,
  validateFields,
  inscriptionController.update,
)
router.delete("/:id", inscriptionValidator.validateIdExists, inscriptionController.delete)

export const InscriptionRoute = router

export default router
