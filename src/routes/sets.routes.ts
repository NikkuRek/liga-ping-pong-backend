// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\routes\sets.routes.ts
import { Router } from "express"
import { validateFields } from "../middlewares"
import { SetsController } from "../controllers"
import { SetsValidator } from "../validators"

const router = Router()
const setsController = new SetsController()
const setsValidator = new SetsValidator()

router.get("/", setsController.all) // http://localhost:3000/api/sets
router.get("/:id", setsValidator.validateIdExists, setsController.one)
router.get("/match/:matchId", setsController.getByMatch)
router.post(
    "/",
    setsValidator.validateFields,
    setsValidator.validateMatchExists,
    setsValidator.validateUniqueSetNumber,
    validateFields,
    setsController.create,
)
router.put(
    "/:id",
    setsValidator.validateFields,
    setsValidator.validateIdExists,
    setsValidator.validateMatchExists,
    setsValidator.validateUniqueSetNumber,
    validateFields,
    setsController.update,
)
router.delete("/:id", setsValidator.validateIdExists, setsController.delete)

export const SetsRoute = router

export default router
