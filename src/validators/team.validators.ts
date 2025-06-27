import { check, param } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { TeamDB, PlayerDB } from "../config/sequelize.config"
import { Op } from "sequelize"

export class TeamValidator {
  validateFields = [
    check("player1_ci", "La cédula del primer jugador es obligatoria").not().isEmpty(),
    check("player1_ci", "La cédula del primer jugador debe ser una cadena de texto").isString(),
    check("player2_ci", "La cédula del segundo jugador es obligatoria").not().isEmpty(),
    check("player2_ci", "La cédula del segundo jugador debe ser una cadena de texto").isString(),
  ]

  validatePlayersExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { player1_ci, player2_ci } = req.body

      // Verificar si el primer jugador existe
      const player1 = await PlayerDB.findByPk(player1_ci)
      if (!player1) {
        return res.status(404).json({
          message: `El jugador con CI ${player1_ci} no existe`,
        })
      }

      // Verificar si el segundo jugador existe
      const player2 = await PlayerDB.findByPk(player2_ci)
      if (!player2) {
        return res.status(404).json({
          message: `El jugador con CI ${player2_ci} no existe`,
        })
      }

      // Verificar que los jugadores sean diferentes
      if (player1_ci === player2_ci) {
        return res.status(400).json({
          message: "Los jugadores en un equipo deben ser diferentes",
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar los jugadores",
      })
    }
  }

  validateUniqueTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { player1_ci, player2_ci, name } = req.body
      const idFromParams = req.params.team_id

      // Verificar si ya existe un equipo con estos jugadores (en cualquier orden)
      const existingTeam = await TeamDB.findOne({
        where: {
          [Op.or]: [
            { player1_ci, player2_ci },
            { player1_ci: player2_ci, player2_ci: player1_ci },
          ],
        },
      })

      if (existingTeam) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10)
          if (existingTeam.getDataValue("team_id") !== paramIdNum) {
            return res.status(400).json({
              message: "Ya existe un equipo con estos jugadores",
            })
          }
        } else {
          return res.status(400).json({
            message: "Ya existe un equipo con estos jugadores",
          })
        }
      }

      // Verificar si ya existe un equipo con el mismo nombre
      if (name) {
        const existingName = await TeamDB.findOne({
          where: {
            name,
            ...(idFromParams && {
              team_id: { [Op.ne]: Number.parseInt(idFromParams, 10) },
            }),
          },
        })
        if (existingName) {
          return res.status(400).json({
            message: "Ya existe un equipo con este nombre",
          })
        }
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar la unicidad del equipo",
      })
    }
  }

  validateIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.team_id

      if (!idFromParams) {
        return next()
      }

      const idToCheck = Number.parseInt(idFromParams, 10)

      if (isNaN(idToCheck)) {
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams}" no es un número válido.`,
        })
      }

      const existingTeam = await TeamDB.findByPk(idToCheck)

      if (!existingTeam) {
        return res.status(404).json({
          message: `Equipo con ID ${idToCheck} no encontrado.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID del equipo",
      })
    }
  }
}

export const teamValidators = new TeamValidator()
