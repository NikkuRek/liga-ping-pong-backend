import { Router } from "express"
import { validateFields } from "../middlewares"
import { CredentialController } from "../controllers"
import { CredentialValidator } from "../validators"

const router = Router()
const credentialController = new CredentialController()
const credentialValidator = new CredentialValidator()

router.get("/", credentialController.all) // http://localhost:3000/api/credential
router.get("/:id", credentialController.one) // http://localhost:3000/api/credential/id
router.get("/player/:player_ci", credentialController.byPlayerCI) // http://localhost:3000/api/credential/player/ci
router.post(
  "/",
  credentialValidator.validateFields,
  credentialValidator.validatePlayerCIExists,
  validateFields,
  credentialController.create,
) // http://localhost:3000/api/credential

router.post("/authenticate", credentialValidator.validateAuthFields, validateFields, credentialController.authenticate) // http://localhost:3000/api/credential/authenticate

router.put("/:id", credentialValidator.validateUpdateFields, validateFields, credentialController.update) // http://localhost:3000/api/credential/id

router.put("/", credentialValidator.validateUpdateByPlayerCI, validateFields, credentialController.updateByPlayerCI) // http://localhost:3000/api/credential

router.delete("/:id", credentialController.delete) // http://localhost:3000/api/credential/id

export const CredentialRoute = router

export default router
