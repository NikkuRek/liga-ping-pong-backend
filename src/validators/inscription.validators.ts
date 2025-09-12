import { check } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import { InscriptionDB, PlayerDB, TournamentDB } from "../config/sequelize.config";

export class InscriptionValidator {
  validateFields = [
    check(["player_ci", "team_id"]).custom((_, { req }) => {
      if (!req.body.player_ci && !req.body.team_id) {
        throw new Error("Debe proporcionar al menos player_ci o team_id");
      }
      if (req.body.player_ci && req.body.team_id) {
        throw new Error("No puede proporcionar player_ci y team_id a la vez");
      }
      return true;
    }),
    check("player_ci").custom((value, { req }) => {
      if (req.body.player_ci && isNaN(Number(req.body.player_ci))) {
        throw new Error("player_ci debe ser numérico");
      }
      return true;
    }),
    check("team_id").custom((value, { req }) => {
      if (req.body.team_id && isNaN(Number(req.body.team_id))) {
        throw new Error("team_id debe ser numérico");
      }
      return true;
    }),
    check("tournament_id", "El ID del torneo es obligatorio").not().isEmpty(),
    check("tournament_id", "El ID del torneo debe ser numérico").isNumeric(),
  ];

  validateIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.id;
      if (!idFromParams) return next();

      const idToCheck = Number.parseInt(idFromParams, 10);
      if (isNaN(idToCheck)) {
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams}" no es un número válido.`,
        });
      }

      const existingInscription = await InscriptionDB.findByPk(idToCheck);
      if (!existingInscription) {
        return res.status(404).json({
          message: `inscripción con ID ${idToCheck} no encontrada.`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID de la inscripción",
      });
    }
  };

  validatePlayerAndTournamentExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { player_ci, tournament_id, team_id } = req.body;
      if (player_ci == null) return next();

      const player = await PlayerDB.findByPk(player_ci);
      if (!player) {
        const { TeamDB } = await import("../config/sequelize.config");
        const team = await TeamDB.findByPk(team_id);
        if (team) return next();
        return res.status(404).json({
          message: `El jugador con player_ci ${player_ci} ni el equipo con ID ${team_id} existen`,
        });
      }

      const tournament = await TournamentDB.findByPk(tournament_id);
      if (!tournament) {
        return res.status(404).json({
          message: `El torneo con ID ${tournament_id} no existe`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el jugador y el torneo",
      });
    }
  };

  validateUniqueInscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { player_ci, tournament_id } = req.body;
      const idFromParams = req.params.id;
      if (player_ci == null) return next();

      const existingInscription = await InscriptionDB.findOne({
        where: { player_ci, tournament_id },
      });

      if (existingInscription) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10);
          if (existingInscription.getDataValue("id") !== paramIdNum) {
            if (req.method === "PUT") return next();
            return res.status(400).json({
              message: `El jugador ya está inscrito en este torneo`,
            });
          }
          return next();
        }
        return res.status(400).json({
          message: `El jugador ya está inscrito en este torneo`,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar la inscripción única",
      });
    }
  };
}

export const inscriptionValidators = new InscriptionValidator();
