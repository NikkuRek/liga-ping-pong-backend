
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { MatchDB } from "../config/sequelize.config";
import { MatchInterface } from "../interfaces";

export const matchLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const { tournament_id, inscription1_id, inscription2_id } = req.body;

    // Solo aplicar el limitador para el torneo de ranked (ID 2)
    if (tournament_id !== 2) {
        return next();
    }

    if (!inscription1_id || !inscription2_id) {
        return res.status(400).json({
            message: "Las inscripciones de los jugadores son obligatorias.",
        });
    }

    try {
        // Calcular el inicio y fin de la semana actual (Lunes a Domingo)
        const now = new Date();
        const dayOfWeek = now.getDay(); 
        const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7); // Domingo
        endOfWeek.setHours(23, 59, 59, 999);

        // Obtener TODOS los partidos de ranked de la semana para analizar límites globales
        const weeklyMatches: any[] = await MatchDB.findAll({
            where: {
                tournament_id: 2,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
                // Solo nos interesan los terminados o en curso para la lógica de límites
                // status: { [Op.ne]: 'Cancelado' } // Si existiera
            },
        });

        const getPlayerStats = (playerInscriptionId: number) => {
            const playerMatches = weeklyMatches.filter(
                m => m.inscription1_id === playerInscriptionId || m.inscription2_id === playerInscriptionId
            );

            // Agrupar por oponente para ver quiénes están bloqueados
            const opponentStats: { [key: number]: { count: number, wins: number, opponentWins: number } } = {};
            
            playerMatches.forEach(m => {
                const opponentId = m.inscription1_id === playerInscriptionId ? m.inscription2_id : m.inscription1_id;
                if (!opponentStats[opponentId]) {
                    opponentStats[opponentId] = { count: 0, wins: 0, opponentWins: 0 };
                }
                opponentStats[opponentId].count++;
                if (m.winner_inscription_id === playerInscriptionId) {
                    opponentStats[opponentId].wins++;
                } else if (m.winner_inscription_id && m.winner_inscription_id === opponentId) {
                    opponentStats[opponentId].opponentWins++;
                }
            });

            const blockedOpponentIds = Object.keys(opponentStats)
                .map(Number)
                .filter(oppId => {
                    const stats = opponentStats[oppId];
                    // Regla: 3 partidos O uno ganó 2 (2-0, 2-1)
                    return stats.count >= 3 || stats.wins >= 2 || stats.opponentWins >= 2;
                });

            return {
                totalPlayed: playerMatches.length,
                remainingWeekly: Math.max(0, 10 - playerMatches.length),
                blockedOpponentInscriptions: blockedOpponentIds
            };
        };

        const statsP1 = getPlayerStats(inscription1_id);
        const statsP2 = getPlayerStats(inscription2_id);

        const responseStats = {
            player1: statsP1,
            player2: statsP2
        };

        // Regla 1: Límite global (10 partidos por semana)
        if (statsP1.totalPlayed >= 10) {
            return res.status(429).json({
                message: `Límite semanal alcanzado para el jugador 1.`,
                stats: responseStats
            });
        }
        if (statsP2.totalPlayed >= 10) {
            return res.status(429).json({
                message: `Límite semanal alcanzado para el jugador 2.`,
                stats: responseStats
            });
        }

        // Regla 2: Límite específico entre estos dos jugadores
        const matchesBetween = weeklyMatches.filter(m => 
            (m.inscription1_id === inscription1_id && m.inscription2_id === inscription2_id) ||
            (m.inscription1_id === inscription2_id && m.inscription2_id === inscription1_id)
        );

        const count = matchesBetween.length;
        if (count >= 3) {
            return res.status(429).json({
                message: "Límite de enfrentamientos directos (3) alcanzado esta semana.",
                stats: responseStats
            });
        }

        const winsP1 = matchesBetween.filter(m => m.winner_inscription_id === inscription1_id).length;
        const winsP2 = matchesBetween.filter(m => m.winner_inscription_id === inscription2_id).length;

        if (winsP1 === 2 || winsP2 === 2) {
            return res.status(429).json({
                message: `Serie finalizada. Un jugador ya ganó 2 partidos (${winsP1}-${winsP2}).`,
                stats: responseStats
            });
        }

        // Si pasa todas las validaciones, podemos adjuntar los stats a la respuesta si queremos que el controller los use
        (req as any).matchStats = responseStats;

        next();
    } catch (error) {
        console.error("Error in match limiter middleware:", error);
        return res.status(500).json({
            message: "Error interno al validar los límites del partido.",
        });
    }
};
