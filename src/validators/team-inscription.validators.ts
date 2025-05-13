import { check, param } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { TeamInscriptionDB, TeamDB, TournamentDB } from "../config/sequelize.config"

export class TeamInscriptionValidator {
  validateFields = [
    check("id_team", "El ID del equipo es obligatorio").not().isEmpty().isNumeric(),
    check("id_tournament", "El ID del torneo es obligatorio").not().isEmpty().isNumeric(),
    check("id_team").custom(async (id: number) => {
      const team = await TeamDB.findByPk(id)
      if (!team) {
        throw new Error(`El equipo con ID ${id} no existe`)
      }
      return true
    }),
    check("id_tournament").custom(async (id: number) => {
      const tournament = await TournamentDB.findByPk(id)
      if (!tournament) {
        throw new Error(`El torneo con ID ${id} no existe`)
      }
      return true
    }),
    check("id_tournament").custom(async (id: number) => {
      const tournament = await TournamentDB.findByPk(id)
      if (tournament && tournament.getDataValue("type") !== "Dobles") {
        throw new Error("Solo se pueden inscribir equipos en torneos de tipo 'Dobles'")
      }
      return true
    }),
  ]

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

      const existingInscription = await TeamInscriptionDB.findByPk(idToCheck)

      if (!existingInscription) {
        return res.status(404).json({
          message: `Inscripción de equipo con ID ${idToCheck} no encontrada.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID de la inscripción de equipo",
      })
    }
  }

  validateUniqueInscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_team, id_tournament } = req.body
      const idFromParams = req.params.id

      if (!id_team || !id_tournament) {
        return next()
      }

      const existingInscriptions = await TeamInscriptionDB.findAll({
        where: { id_team, id_tournament },
      })

      if (existingInscriptions.length > 0) {
        const duplicate = existingInscriptions.find(
          (inscription) => !idFromParams || inscription.getDataValue("id") !== Number(idFromParams),
        )

        if (duplicate) {
          return res.status(400).json({
            message: "El equipo ya está inscrito en este torneo",
          })
        }
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar la inscripción única del equipo",
      })
    }
  }
}

export const teamInscriptionValidators = new TeamInscriptionValidator()
