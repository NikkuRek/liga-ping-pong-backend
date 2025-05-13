import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { SetsDB, MatchDB } from "../config/sequelize.config"

export class SetsValidator {
  validateFields = [
    check("match_id", "El ID del partido es obligatorio").not().isEmpty(),
    check("match_id", "El ID del partido debe ser numérico").isNumeric(),
    check("score1", "La puntuación del equipo 1 es obligatoria").not().isEmpty(),
    check("score1", "La puntuación del equipo 1 debe ser numérica").isNumeric(),
    check("score2", "La puntuación del equipo 2 es obligatoria").not().isEmpty(),
    check("score2", "La puntuación del equipo 2 debe ser numérica").isNumeric(),
  ]

  validateMatchExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { match_id } = req.body

      // Verificar si el partido existe
      const match = await MatchDB.findByPk(match_id)
      if (!match) {
        return res.status(404).json({
          message: `El partido con ID ${match_id} no existe`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el partido",
      })
    }
  }

  validateUniqueSetNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number, match_id } = req.body
      const idFromParams = req.params.id

      if (number) {
        const existingSets = await SetsDB.findAll({
          where: { match_id },
        })

        const duplicateSet = existingSets.find(
          (set) => set.getDataValue("number") === number && (!idFromParams || set.getDataValue("id_sets") !== Number(idFromParams))
        )

        if (duplicateSet) {
          return res.status(400).json({
            message: `Ya existe un set con el número ${number} para este partido`,
          })
        }
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el número único del set",
      })
    }
  }

  validateIdExists = async (req: Request, res: Response, next: NextFunction) => {
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

      const existingSet = await SetsDB.findByPk(idToCheck)

      if (!existingSet) {
        return res.status(404).json({
          message: `Set con ID ${idToCheck} no encontrado.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID del set",
      })
    }
  }
}

export const setsValidators = new SetsValidator()
