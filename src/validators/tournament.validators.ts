import { check, param } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { TournamentDB } from "../config/sequelize.config"

export class TournamentValidator {
  validateFields = [
    check("name", "El nombre del torneo es obligatorio").not().isEmpty(),
    check("format", "El formato del torneo es obligatorio").not().isEmpty(),
    check("tournament_type", "El tipo de torneo es obligatorio")
      .not()
      .isEmpty()
      .isIn(["Individual", "Dobles"])
      .withMessage("El tipo debe ser Individual o Dobles"),
    check("start_date", "La fecha de inicio es obligatoria")
      .not()
      .isEmpty()
      .isISO8601()
      .withMessage("La fecha de inicio debe tener un formato válido"),
    // Permitir null en end_date usando optional({ nullable: true })
    check("end_date")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("La fecha de fin debe tener un formato válido"),
    check("status")
      .optional()
      .isIn(["Próximo", "En Curso", "Finalizado", "Cancelado"])
      .withMessage("El estado debe ser Próximo, En Curso, Finalizado o Cancelado"),
  ]

  validateTournamentIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.tournament_id

      if (!idFromParams) {
        return next()
      }

      const idToCheck = Number.parseInt(idFromParams, 10)

      if (isNaN(idToCheck)) {
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams}" no es un número válido.`,
        })
      }

      const existingTournament = await TournamentDB.findByPk(idToCheck)

      if (!existingTournament) {
        return res.status(404).json({
          message: `Torneo con ID ${idToCheck} no encontrado.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID del torneo",
      })
    }
  }

  // Ajustado para permitir nombres de torneos repetidos: no realiza validación única
  validateTournamentNameUnique = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // No realizar ninguna comprobación y permitir nombres duplicados
      return next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el nombre único del torneo",
      })
    }
  }
}

export const tournamentValidators = new TournamentValidator()
