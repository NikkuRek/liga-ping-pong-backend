import { check, param } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { TournamentPlayerStatsDB, InscriptionDB } from "../config/sequelize.config"

export class TournamentPlayerStatsValidator {
  validateFields = [
    check("id_inscription", "El ID de inscripción es obligatorio").not().isEmpty(),
    check("id_inscription", "El ID de inscripción debe ser numérico").isNumeric(),
    check("games_played", "El número de partidos jugados debe ser un número").optional().isNumeric(),
    check("wins", "El número de victorias debe ser un número").optional().isNumeric(),
    check("losses", "El número de derrotas debe ser un número").optional().isNumeric(),
    check("points_for", "Los puntos a favor deben ser un número").optional().isNumeric(),
    check("points_against", "Los puntos en contra deben ser un número").optional().isNumeric(),
    check("sets_for", "Los sets a favor deben ser un número").optional().isNumeric(),
    check("sets_against", "Los sets en contra deben ser un número").optional().isNumeric(),
  ]

  validateInscriptionExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_inscription } = req.body

      // Verificar si la inscripción existe
      const inscription = await InscriptionDB.findByPk(id_inscription)
      if (!inscription) {
        return res.status(404).json({
          message: `La inscripción con ID ${id_inscription} no existe`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar la inscripción",
      })
    }
  }

  validateStatsIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.id

      if (!idFromParams) {
        return next()
      }

      const idToCheck = Number.parseInt(idFromParams, 10)

      if (isNaN(idToCheck)) {
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams}" no es un número válido.`,
        })
      }

      const existingStats = await TournamentPlayerStatsDB.findByPk(idToCheck)

      if (!existingStats) {
        return res.status(404).json({
          message: `Estadísticas con ID ${idToCheck} no encontradas.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID de las estadísticas",
      })
    }
  }

  validateUniqueStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_inscription } = req.body
      const idFromParams = req.params.id

      const existingStats = await TournamentPlayerStatsDB.findOne({
        where: { id_inscription },
      })

      if (existingStats) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10)
          if (existingStats.getDataValue("id") !== paramIdNum) {
            return res.status(400).json({
              message: `Ya existen estadísticas para esta inscripción`,
            })
          } else {
            return next()
          }
        } else {
          return res.status(400).json({
            message: `Ya existen estadísticas para esta inscripción`,
          })
        }
      } else {
        next()
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar las estadísticas únicas",
      })
    }
  }
}

export const tournamentPlayerStatsValidators = new TournamentPlayerStatsValidator()
