import { Router } from "express"
import { validateFields } from "../middlewares"
import { TeamController } from "../controllers"
import { teamValidators } from "../validators"

// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\routes\team.routes.ts

const router = Router()
const teamController = new TeamController()

// Obtener todos los equipos
router.get("/", teamController.all) // GET /api/team

// Obtener equipos por jugador
router.get("/player/:CI", teamController.getByPlayer) // GET /api/team/player/:CI

// Obtener un equipo por ID
router.get("/:id", teamValidators.validateIdExists, teamController.one) // GET /api/team/:id

// Crear un nuevo equipo
router.post(
    "/",
    teamValidators.validateFields,
    validateFields,
    teamValidators.validatePlayersExist,
    teamValidators.validateUniqueTeam,
    teamController.create,
) // POST /api/team

// Actualizar un equipo existente
router.put(
    "/:id",
    teamValidators.validateFields,
    validateFields,
    teamValidators.validatePlayersExist,
    teamValidators.validateUniqueTeam,
    teamValidators.validateIdExists,
    teamController.update,
) // PUT /api/team/:id

// Eliminar un equipo
router.delete(
    "/:id",
    teamValidators.validateIdExists,
    teamController.delete,
) // DELETE /api/team/:id

export const TeamRoute = router

export default router