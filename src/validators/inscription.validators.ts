// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\validators\inscription.validators.ts
import { check, param } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { InscriptionDB, PlayerDB, TournamentDB } from "../config/sequelize.config"

export class InscriptionValidator {
  validateFields = [
    check("CI", "La cédula del jugador es obligatoria").not().isEmpty(),
    check("CI", "La cédula del jugador debe ser una cadena de texto").isString(),
    check("id_tournament", "El ID del torneo es obligatorio").not().isEmpty(),
    check("id_tournament", "El ID del torneo debe ser numérico").isNumeric(),
  ]

  validatePlayerAndTournamentExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { CI, id_tournament } = req.body

      // Verificar si el jugador existe
      const player = await PlayerDB.findByPk(CI)
      if (!player) {
        return res.status(404).json({
          message: `El jugador con CI ${CI} no existe`,
        })
      }

      // Verificar si el torneo existe
      const tournament = await TournamentDB.findByPk(id_tournament)
      if (!tournament) {
        return res.status(404).json({
          message: `El torneo con ID ${id_tournament} no existe`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el jugador y el torneo",
      })
    }
  }

  validateUniqueInscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { CI, id_tournament } = req.body
      const idFromParams = req.params.id

      const existingInscription = await InscriptionDB.findOne({
        where: { CI, id_tournament },
      })

      if (existingInscription) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10)
          if (existingInscription.getDataValue("id") !== paramIdNum) {
            return res.status(400).json({
              message: `El jugador ya está inscrito en este torneo`,
            })
          } else {
            return next()
          }
        } else {
          return res.status(400).json({
            message: `El jugador ya está inscrito en este torneo`,
          })
        }
      } else {
        next()
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar la inscripción única",
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

      const existingInscription = await InscriptionDB.findByPk(idToCheck)

      if (!existingInscription) {
        return res.status(404).json({
          message: `Inscripción con ID ${idToCheck} no encontrada.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID de la inscripción",
      })
    }
  }
}

export const inscriptionValidators = new InscriptionValidator()
