
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { MatchDB } from "../config/sequelize.config";
import { MatchInterface } from "../interfaces";

export const matchLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const { tournament_id, inscription1_id, inscription2_id } = req.body;

    // Apply limiter only for ranked tournament (ID 2)
    if (tournament_id !== 2) {
        return next();
    }

    if (!inscription1_id || !inscription2_id) {
        return res.status(400).json({
            message: "Las inscripciones de los jugadores son obligatorias.",
        });
    }

    try {
        // Calculate the start and end of the current week (Monday to Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
        const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Find all ranked matches for both players in the current week
        const weeklyMatches: any = await MatchDB.findAll({
            where: {
                tournament_id: 2,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
                [Op.or]: [
                    { inscription1_id: [inscription1_id, inscription2_id] },
                    { inscription2_id: [inscription1_id, inscription2_id] },
                ],
            },
        });

        // Rule 1: Check total matches per player (max 6)
        const matchesByPlayer1 = weeklyMatches.filter(
            (m: MatchInterface) => m.inscription1_id === inscription1_id || m.inscription2_id === inscription1_id
        );
        const matchesByPlayer2 = weeklyMatches.filter(
            (m: MatchInterface) => m.inscription1_id === inscription2_id || m.inscription2_id === inscription2_id
        );

        if (matchesByPlayer1.length >= 6) {
            return res.status(429).json({
                message: `El jugador con inscripción ID ${inscription1_id} ya ha jugado 6 partidos de ranked esta semana.`,
            });
        }

        if (matchesByPlayer2.length >= 6) {
            return res.status(429).json({
                message: `El jugador con inscripción ID ${inscription2_id} ya ha jugado 6 partidos de ranked esta semana.`,
            });
        }

        // Rule 2: Check matches between the same two players (max 3)
        const matchesBetweenPlayers = weeklyMatches.filter(
            (m: MatchInterface) =>
                (m.inscription1_id === inscription1_id && m.inscription2_id === inscription2_id) ||
                (m.inscription1_id === inscription2_id && m.inscription2_id === inscription1_id)
        );

        if (matchesBetweenPlayers.length >= 3) {
            return res.status(429).json({
                message: `Estos dos jugadores ya se han enfrentado 3 veces en ranked esta semana.`,
            });
        }

        next();
    } catch (error) {
        console.error("Error in match limiter middleware:", error);
        return res.status(500).json({
            message: "Error interno al validar los límites del partido.",
        });
    }
};
