import { check, param } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import { MatchDB, InscriptionDB, TournamentDB } from "../config/sequelize.config";

export class MatchValidator {
  validateFields = [
    check("tournament_id", "El ID del torneo es obligatorio").not().isEmpty(),
    check("tournament_id", "El ID del torneo debe ser numérico").isNumeric(),
    check("match_datetime", "La fecha y hora del partido son obligatorias").not().isEmpty(),
    check("match_datetime", "La fecha y hora deben tener un formato válido").isISO8601(),
    check("round", "La ronda del partido es obligatoria").not().isEmpty(),
    check("inscription1_id", "El ID de la primera inscripción es obligatorio").not().isEmpty(),
    check("inscription1_id", "El ID de la primera inscripción debe ser numérico").isNumeric(),
    check("inscription2_id", "El ID de la segunda inscripción es obligatorio").not().isEmpty(),
    check("inscription2_id", "El ID de la segunda inscripción debe ser numérico").isNumeric(),
  ];

  validateTournamentAndInscriptionsExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tournament_id, inscription1_id, inscription2_id } = req.body;

      // Verificar si el torneo existe
      const tournament = await TournamentDB.findByPk(tournament_id);
      if (!tournament) {
        return res.status(404).json({
          message: `El torneo con ID ${tournament_id} no existe`,
        });
      }

      // Verificar si la primera inscripción existe
      const inscription1 = await InscriptionDB.findByPk(inscription1_id);
      if (!inscription1) {
        return res.status(404).json({
          message: `La inscripción con ID ${inscription1_id} no existe`,
        });
      }

      // Verificar si la segunda inscripción existe
      const inscription2 = await InscriptionDB.findByPk(inscription2_id);
      if (!inscription2) {
        return res.status(404).json({
          message: `La inscripción con ID ${inscription2_id} no existe`,
        });
      }

      // Verificar que las inscripciones sean diferentes
      if (inscription1_id === inscription2_id) {
        return res.status(400).json({
          message: "Las inscripciones del partido deben ser diferentes",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el torneo y las inscripciones",
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

  validateWinnerLosserInscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { winner_inscription_id, loser_inscription_id } = req.body;
      const matchId = req.params.id;

      const match = await MatchDB.findByPk(matchId);

      if (!match) {
        return res.status(404).json({
          message: `Partido con ID ${matchId} no encontrado.`,
        });
      }

      const inscription1 = match.getDataValue("inscription1_id");
      const inscription2 = match.getDataValue("inscription2_id");

      // Verificar que el ganador sea una de las inscripciones del partido
      if (
        winner_inscription_id !== inscription1 &&
        winner_inscription_id !== inscription2
      ) {
        return res.status(400).json({
          message: "La inscripción ganadora debe ser una de las inscripciones del partido",
        });
      }

      // Verificar que el perdedor exista y sea una de las inscripciones del partido
      if (
        loser_inscription_id !== inscription1 &&
        loser_inscription_id !== inscription2
      ) {
        return res.status(400).json({
          message: "La inscripción perdedora debe ser una de las inscripciones del partido",
        });
      }

      // Verificar que ganador y perdedor sean diferentes
      if (winner_inscription_id === loser_inscription_id) {
        return res.status(400).json({
          message: "La inscripción ganadora y la perdedora deben ser diferentes",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar la inscripción ganadora y perdedora",
      });
    }
  };
}

export const matchValidators = new MatchValidator();
