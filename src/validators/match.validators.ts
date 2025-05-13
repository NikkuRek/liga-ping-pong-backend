import { check, param } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import { MatchDB, TeamInscriptionDB, TournamentDB } from "../config/sequelize.config";

export class MatchValidator {
  validateFields = [
    check("id_tournament", "El ID del torneo es obligatorio").not().isEmpty(),
    check("id_tournament", "El ID del torneo debe ser numérico").isNumeric(),
    check("match_date_time", "La fecha y hora del partido son obligatorias").not().isEmpty(),
    check("match_date_time", "La fecha y hora deben tener un formato válido").isISO8601(),
    check("round", "La ronda del partido es obligatoria").not().isEmpty(),
    check("id_team_inscription1", "El ID del primer equipo es obligatorio").not().isEmpty(),
    check("id_team_inscription1", "El ID del primer equipo debe ser numérico").isNumeric(),
    check("id_team_inscription2", "El ID del segundo equipo es obligatorio").not().isEmpty(),
    check("id_team_inscription2", "El ID del segundo equipo debe ser numérico").isNumeric(),
  ];

  validateTournamentAndTeamsExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_tournament, id_team_inscription1, id_team_inscription2 } = req.body;

      // Verificar si el torneo existe
      const tournament = await TournamentDB.findByPk(id_tournament);
      if (!tournament) {
        return res.status(404).json({
          message: `El torneo con ID ${id_tournament} no existe`,
        });
      }

      // Verificar si el primer equipo existe
      const team1 = await TeamInscriptionDB.findByPk(id_team_inscription1);
      if (!team1) {
        return res.status(404).json({
          message: `El equipo con ID ${id_team_inscription1} no existe`,
        });
      }

      // Verificar si el segundo equipo existe
      const team2 = await TeamInscriptionDB.findByPk(id_team_inscription2);
      if (!team2) {
        return res.status(404).json({
          message: `El equipo con ID ${id_team_inscription2} no existe`,
        });
      }

      // Verificar que los equipos sean diferentes
      if (id_team_inscription1 === id_team_inscription2) {
        return res.status(400).json({
          message: "Los equipos del partido deben ser diferentes",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el torneo y los equipos",
      });
    }
  };

  validateMatchIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.id;

      if (!idFromParams) {
        return next();
      }

      const idToCheck = Number.parseInt(idFromParams, 10);

      if (isNaN(idToCheck)) {
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams}" no es un número válido.`,
        });
      }

      const existingMatch = await MatchDB.findByPk(idToCheck);

      if (!existingMatch) {
        return res.status(404).json({
          message: `Partido con ID ${idToCheck} no encontrado.`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID del partido",
      });
    }
  };

  validateWinnerAndLoser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { winner_team_inscription_id, loser_team_inscription_id } = req.body;
      const matchId = req.params.id;

      const match = await MatchDB.findByPk(matchId);

      if (!match) {
        return res.status(404).json({
          message: `Partido con ID ${matchId} no encontrado.`,
        });
      }

      const team1 = match.getDataValue("id_team_inscription1");
      const team2 = match.getDataValue("id_team_inscription2");

      // Verificar que el equipo ganador sea uno de los equipos del partido
      if (winner_team_inscription_id !== team1 && winner_team_inscription_id !== team2) {
        return res.status(400).json({
          message: "El equipo ganador debe ser uno de los equipos del partido",
        });
      }

      // Verificar que el equipo perdedor sea uno de los equipos del partido
      if (loser_team_inscription_id !== team1 && loser_team_inscription_id !== team2) {
        return res.status(400).json({
          message: "El equipo perdedor debe ser uno de los equipos del partido",
        });
      }

      // Verificar que el ganador y el perdedor sean diferentes
      if (winner_team_inscription_id === loser_team_inscription_id) {
        return res.status(400).json({
          message: "El ganador y el perdedor no pueden ser el mismo equipo",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ganador y el perdedor",
      });
    }
  };
}

export const matchValidators = new MatchValidator();
