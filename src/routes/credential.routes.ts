import { Router } from "express"
import { validateFields, validateToken } from "../middlewares"
import { CredentialController } from "../controllers"
import { CredentialValidator } from "../validators"

const router = Router()
const credentialController = new CredentialController()
const credentialValidator = new CredentialValidator()

router.get("/", validateToken, credentialController.all) // http://localhost:3004/api/credential
router.get("/:id", validateToken, credentialController.one) // http://localhost:3004/api/credential/id
router.get("/player/:player_ci", validateToken, credentialController.byPlayerCI) // http://localhost:3004/api/credential/player/ci
router.post(
  "/",
  credentialValidator.validateFields,
  credentialValidator.validatePlayerCIExists,
  validateFields,
  credentialController.create,
) // http://localhost:3004/api/credential

router.post("/authenticate", credentialValidator.validateAuthFields, validateFields, credentialController.authenticate) // http://localhost:3004/api/credential/authenticate

router.post("/logout", credentialController.logout) // http://localhost:3004/api/credential/logout

router.put("/:id", validateToken, credentialValidator.validateUpdateFields, validateFields, credentialController.update) // http://localhost:3004/api/credential/id

router.put("/", validateToken, credentialValidator.validateUpdateByPlayerCI, validateFields, credentialController.updateByPlayerCI) // http://localhost:3004/api/credential

router.delete("/:id", validateToken, credentialController.delete) // http://localhost:3004/api/credential/id
router.patch("/:id", validateToken, credentialController.patch) // http://localhost:3004/api/credential/id

export const CredentialRoute = router

export default router
