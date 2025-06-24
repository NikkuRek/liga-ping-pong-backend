// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\validators\inscription.validators.ts
import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { InscriptionDB, PlayerDB, TournamentDB } from "../config/sequelize.config"

export class InscriptionValidator {
  validateFields = [
    check(["player_ci", "team_id"])
      .custom((value, { req }) => {
        if (!req.body.player_ci && !req.body.team_id) {
          throw new Error("Debe proporcionar al menos player_ci o team_id");
        }
        if (req.body.player_ci && req.body.team_id) {
          throw new Error("No puede proporcionar player_ci y team_id a la vez");
        }
        return true;
      }),
    check("player_ci")
      .custom((value, { req }) => {
        if (req.body.player_ci) {
          if (isNaN(Number(req.body.player_ci))) {
            throw new Error("player_ci debe ser numérico");
          }
        }
        return true;
      }),
    check("team_id")
      .custom((value, { req }) => {
        if (req.body.team_id) {
          if (isNaN(Number(req.body.team_id))) {
            throw new Error("team_id debe ser numérico");
          }
        }
        return true;
      }),
    check("tournament_id", "El ID del torneo es obligatorio").not().isEmpty(),
    check("tournament_id", "El ID del torneo debe ser numérico").isNumeric(),
  ]

  validateIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.id

      console.log("--- validateIdExists (Inscription) Debug ---")
      console.log("ID desde Params:", `'${idFromParams}'`, typeof idFromParams)

      if (!idFromParams) {
        console.log("validateIdExists (Inscription): No hay ID para verificar, pasando...")
        return next()
      }

      const idToCheck = Number.parseInt(idFromParams, 10)

      if (isNaN(idToCheck)) {
        console.log(`validateIdExists (Inscription): ID proporcionado "${idFromParams}" no es un número válido.`)
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams}" no es un número válido.`,
        })
      }

      const existingInscription = await InscriptionDB.findByPk(idToCheck)

      if (!existingInscription) {
        console.log(`validateIdExists (Inscription): inscripción con ID ${idToCheck} no encontrada.`)
        return res.status(404).json({
          message: `inscripción con ID ${idToCheck} no encontrada.`,
        })
      }

      console.log(`validateIdExists (Inscription): inscripción con ID ${idToCheck} encontrada, pasando.`)
      next()
    } catch (error) {
      console.error("Error en validateIdExists (Inscription):", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID de la inscripción",
      })
    }
  }

  validatePlayerAndTournamentExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { player_ci, tournament_id, team_id } = req.body

      console.log("--- validatePlayerAndTournamentExist (Inscription) Debug ---")
      console.log("player_ci desde Body:", `'${player_ci}'`, typeof player_ci)
      console.log("ID Torneo desde Body:", `'${tournament_id}'`, typeof tournament_id)
      console.log("team_id desde Body:", `'${team_id}'`, typeof team_id)

      // Si player_ci es null, pasar al siguiente middleware
      if (player_ci == null) {
        console.log("validatePlayerAndTournamentExist (Inscription): player_ci es null, pasando.")
        return next()
      }

      // Verificar si el jugador existe
      const player = await PlayerDB.findByPk(player_ci)
      if (!player) {
        // Si el jugador no existe, verificar si el equipo existe
        const team = await (await import("../config/sequelize.config")).TeamDB.findByPk(team_id)
        if (team) {
          console.log(`validatePlayerAndTournamentExist (Inscription): Jugador no existe pero el equipo con ID ${team_id} sí existe, pasando.`)
          return next()
        } else {
          console.log(`validatePlayerAndTournamentExist (Inscription): Jugador y equipo no existen.`)
          return res.status(404).json({
            message: `El jugador con player_ci ${player_ci} ni el equipo con ID ${team_id} existen`,
          })
        }
      }

      // Verificar si el torneo existe
      const tournament = await TournamentDB.findByPk(tournament_id)
      if (!tournament) {
        console.log(`validatePlayerAndTournamentExist (Inscription): Torneo con ID ${tournament_id} no existe.`)
        return res.status(404).json({
          message: `El torneo con ID ${tournament_id} no existe`,
        })
      }

      console.log("validatePlayerAndTournamentExist (Inscription): Jugador y torneo existen, pasando.")
      next()
    } catch (error) {
      console.error("Error en validatePlayerAndTournamentExist (Inscription):", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar el jugador y el torneo",
      })
    }
  }

  validateUniqueInscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { player_ci, tournament_id } = req.body
      const idFromParams = req.params.id

      console.log("--- validateUniqueInscription (Inscription) Debug ---")
      console.log("player_ci desde Body:", `'${player_ci}'`, typeof player_ci)
      console.log("ID Torneo desde Body:", `'${tournament_id}'`, typeof tournament_id)
      console.log("ID desde Params:", `'${idFromParams}'`, typeof idFromParams)
      console.log("Método HTTP:", req.method)

      // Si player_ci es null, pasar al siguiente middleware
      if (player_ci == null) {
        console.log("validateUniqueInscription (Inscription): player_ci es null, pasando.")
        return next()
      }

      const existingInscription = await InscriptionDB.findOne({
        where: { player_ci, tournament_id },
      })

      if (existingInscription) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10)
          if (existingInscription.getDataValue("id") !== paramIdNum) {
            // Permitir solo si es PUT (actualización)
            if (req.method === "PUT") {
              console.log(
                `validateUniqueInscription (Inscription): PUT - Permitido actualizar inscripción existente.`
              )
              return next()
            }
            console.log(
              `validateUniqueInscription (Inscription): El jugador ya está inscrito en este torneo (ID diferente).`
            )
            return res.status(400).json({
              message: `El jugador ya está inscrito en este torneo`,
            })
          } else {
            console.log(
              `validateUniqueInscription (Inscription): La inscripción corresponde al registro actual, pasando.`
            )
            return next()
          }
        } else {
          console.log(
            `validateUniqueInscription (Inscription): El jugador ya está inscrito en este torneo (nuevo registro duplicado).`
          )
          return res.status(400).json({
            message: `El jugador ya está inscrito en este torneo`,
          })
        }
      } else {
        console.log("validateUniqueInscription (Inscription): No existe inscripción duplicada, pasando.")
        next()
      }
    } catch (error) {
      console.error("Error en validateUniqueInscription (Inscription):", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar la inscripción única",
      })
    }
  }
}

export const inscriptionValidators = new InscriptionValidator()
