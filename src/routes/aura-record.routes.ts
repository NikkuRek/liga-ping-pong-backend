import { Router } from "express"
import { validateFields } from "../middlewares"
import { AuraRecordController } from "../controllers"
import {
  auraRecordIdValidator,
  auraRecordMatchValidator,
  auraRecordPlayerValidator,
  createAuraRecordValidator,
  updateAuraRecordValidator,
} from "../validators/aura-record.validator"

const router = Router()
const auraRecordController = new AuraRecordController()

// http://localhost:3000/api/aura-record
router.get("/", auraRecordController.all)

// http://localhost:3000/api/aura-record/1
router.get("/:id", auraRecordIdValidator, validateFields, auraRecordController.one)

// http://localhost:3000/api/aura-record/player/1234567
router.get(
  "/player/:ci",
  auraRecordPlayerValidator,
  validateFields,
  auraRecordController.getByPlayer,
)

// http://localhost:3000/api/aura-record/match/1
router.get(
  "/match/:matchId",
  auraRecordMatchValidator,
  validateFields,
  auraRecordController.getByMatch,
)

// http://localhost:3000/api/aura-record
router.post("/", createAuraRecordValidator, validateFields, auraRecordController.create)

// http://localhost:3000/api/aura-record/1
router.put("/:id", updateAuraRecordValidator, validateFields, auraRecordController.update)

// http://localhost:3000/api/aura-record/1
router.delete("/:id", auraRecordIdValidator, validateFields, auraRecordController.delete)

export const AuraRecordRoute = router

export default router