import { InscriptionDB, PlayerDB, TeamDB, AuraRecordDB, MatchDB, SetsDB } from "../config/sequelize.config";
import { Op } from "sequelize";

export class AURACalculationService {
    private getKFactor(AvgAura: number) {
        if (AvgAura < 1200) {
            return 40; // K alto para bajo (1000 - 1199)
        } else if (AvgAura >= 1200 && AvgAura < 1400) {
            return 30; // K intermedio para medio-bajo (1200 - 1399)
        } else if (AvgAura >= 1400 && AvgAura < 1600) {
            return 25; // K un poco más bajo para medio-alto (1400 - 1599)
        } else {
            return 20; // K bajo para alto (1600+)
        }
    }

    private readonly DEFAULT_AURA = 1000

    private calculateExpectedScore(auraA: number, auraB: number): number {
        return 1 / (1 + Math.pow(10, (auraB - auraA) / 400))
    }

    private calculateNewAURA(currentAURA: number, expectedScore: number, actualScore: number, avgAURA: number): number {
        const kFactor = this.getKFactor(avgAURA)
        return Math.round(currentAURA + kFactor * (actualScore - expectedScore))
    }

    private async getPlayersFromInscription(inscriptionId: number): Promise<string[]> {
        const inscription = await InscriptionDB.findByPk(inscriptionId)
        if (!inscription) {
            throw new Error(`Inscripción con ID ${inscriptionId} no encontrada`)
        }

        if (inscription.getDataValue("player_ci")) {
            return [inscription.getDataValue("player_ci")]
        }

        if (inscription.getDataValue("team_id")) {
            const team = await TeamDB.findByPk(inscription.getDataValue("team_id"))
            if (!team) {
                throw new Error(`Equipo con ID ${inscription.getDataValue("team_id")} no encontrado`)
            }
            return [team.getDataValue("player1_ci"), team.getDataValue("player2_ci")]
        }

        throw new Error(`Inscripción ${inscriptionId} no tiene jugador ni equipo asociado`)
    }

    private async getAverageAURA(playerCIs: string[]): Promise<number> {
        const players = await PlayerDB.findAll({
            where: { ci: playerCIs },
        })

        if (players.length !== playerCIs.length) {
            throw new Error("No se encontraron todos los jugadores especificados")
        }

        const totalAURA = players.reduce((sum, player) => {
            const aura = player.getDataValue("aura") || this.DEFAULT_AURA
            return sum + aura
        }, 0)

        return totalAURA / players.length
    }

    private async getScoreDifferenceBonus(match_id: number, winnerInscriptionId: number): Promise<number> {
        const sets = await SetsDB.findAll({ where: { match_id } });

        if (sets.length === 0) {
            return 0;
        }

        let winnerTotalScore = 0;
        let loserTotalScore = 0;

        for (const set of sets) {
            const score1 = set.getDataValue("score1");
            const score2 = set.getDataValue("score2");
            const inscription1Id = set.getDataValue("inscription1_id");

            if (inscription1Id === winnerInscriptionId) {
                winnerTotalScore += score1;
                loserTotalScore += score2;
            } else {
                winnerTotalScore += score2;
                loserTotalScore += score1;
            }
        }

        const pointDifference = winnerTotalScore - loserTotalScore;

        if (pointDifference >= 12) {
            return 0.08; // +8%
        } else if (pointDifference >= 9) {
            return 0.06; // +6%
        } else if (pointDifference >= 6) {
            return 0.04; // +4%
        }

        return 0;
    }

    private async getWinningStreakBonus(playerCI: string): Promise<number> {
        const inscriptions = await InscriptionDB.findAll({
            where: { player_ci: playerCI },
            attributes: ['inscription_id']
        });
        const inscriptionIds = inscriptions.map(ins => ins.getDataValue('inscription_id'));

        const recentMatches = await MatchDB.findAll({
            where: {
                [Op.or]: [
                    { inscription1_id: { [Op.in]: inscriptionIds } },
                    { inscription2_id: { [Op.in]: inscriptionIds } }
                ],
                winner_inscription_id: { [Op.ne]: null }
            },
            order: [['match_datetime', 'DESC']]
        });

        let streak = 0;
        for (const match of recentMatches) {
            const winnerId = match.getDataValue('winner_inscription_id');
            if (inscriptionIds.includes(winnerId)) {
                streak++;
            } else {
                break;
            }
        }

        if (streak >= 7) {
            return 0.12; // +12%
        } else if (streak >= 5) {
            return 0.08; // +8%
        } else if (streak >= 3) {
            return 0.04; // +4%
        }

        return 0;
    }

    private async getTournamentMatchBonus(match_id: number): Promise<number> {
        const match = await MatchDB.findByPk(match_id);
        if (!match) return 0;

        const round = match.getDataValue("round");
        switch (round) {
            case "Final":
                return 0.15;
            case "Semifinal":
                return 0.12;
            case "Ronda 3":
            case "Cuartos de Final":
                return 0.10;
            case "Ronda 2":
            case "Octavos de Final":
                return 0.08;
            case "Ronda 1":
            case "Repechaje":
                return 0.06;
            case "Liga":
                return 0.04;
            default:
                if (round !== "Libre") {
                    return 0.02;
                }
                return 0;
        }
    }

    private async getConsistencyStreakBonus(playerCI: string): Promise<number> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const inscriptions = await InscriptionDB.findAll({
            where: { player_ci: playerCI },
            attributes: ['inscription_id']
        });

        const inscriptionIds = inscriptions.map(ins => ins.getDataValue('inscription_id'));

        const matchCount = await MatchDB.count({
            where: {
                [Op.or]: [
                    { inscription1_id: { [Op.in]: inscriptionIds } },
                    { inscription2_id: { [Op.in]: inscriptionIds } }
                ],
                match_datetime: { [Op.gte]: sevenDaysAgo }
            }
        });

        if (matchCount >= 10) {
            return 0.08; // +8%
        } else if (matchCount >= 7) {
            return 0.05; // +5%
        } else if (matchCount >= 5) {
            return 0.02; // +2%
        }

        return 0;
    }

    private getDirectRivalsBonus(winnerAvgAURA: number, loserAvgAURA: number): number {
        const auraDifference = Math.abs(winnerAvgAURA - loserAvgAURA);
        if (auraDifference <= 20) {
            return 0.09; // +9%
        } else if (auraDifference <= 40) {
            return 0.06; // +6%
        } else if (auraDifference <= 60) {
            return 0.03; // +3%
        }
        return 0;
    }

    private async calculateTotalBonusPercentage(playerCI: string, match_id: number, winnerInscriptionId: number, winnerAvgAURA: number, loserAvgAURA: number): Promise<number> {
        const scoreDifferenceBonus = await this.getScoreDifferenceBonus(match_id, winnerInscriptionId);
        console.log(`Bono por diferencia de puntos para ${playerCI}: ${scoreDifferenceBonus}`);

        const winningStreakBonus = await this.getWinningStreakBonus(playerCI);
        console.log(`Bono por racha ganadora para ${playerCI}: ${winningStreakBonus}`);

        const tournamentMatchBonus = await this.getTournamentMatchBonus(match_id);
        console.log(`Bono por tipo de torneo para el partido ${match_id}: ${tournamentMatchBonus}`);

        const consistencyStreakBonus = await this.getConsistencyStreakBonus(playerCI);
        console.log(`Bono por consistencia para ${playerCI}: ${consistencyStreakBonus}`);

        const directRivalsBonus = this.getDirectRivalsBonus(winnerAvgAURA, loserAvgAURA);
        console.log(`Bono por rivalidad directa para el ganador: ${directRivalsBonus}`);

        const totalBonus = scoreDifferenceBonus + winningStreakBonus + tournamentMatchBonus + consistencyStreakBonus + directRivalsBonus;
        console.log(`Total de bonos para ${playerCI}: ${totalBonus}`);

        // Max Bonus 30%
        return Math.min(totalBonus, 0.3);
    }

    async updateAURAAfterMatch(winnerInscriptionId: number, loserInscriptionId: number, match_id: number): Promise<void> {
        try {
            // Obtener jugadores de ambas inscripciones
            const winnerPlayerCIs = await this.getPlayersFromInscription(winnerInscriptionId)
            const loserPlayerCIs = await this.getPlayersFromInscription(loserInscriptionId)

            // Calcular AURA promedio de cada lado
            const winnerAvgAURA = await this.getAverageAURA(winnerPlayerCIs)
            const loserAvgAURA = await this.getAverageAURA(loserPlayerCIs)

            // Calcular probabilidades esperadas
            const winnerExpectedScore = this.calculateExpectedScore(winnerAvgAURA, loserAvgAURA)
            const loserExpectedScore = this.calculateExpectedScore(loserAvgAURA, winnerAvgAURA)
            // Calcular cambios de AURA usando K-factor dinámico
            const kFactor = this.getKFactor((winnerAvgAURA + loserAvgAURA) / 2)
            const winnerAURAChange = kFactor * (1 - winnerExpectedScore)
            const loserAURAChange = kFactor * (0 - loserExpectedScore)

            let totalWinnerAURAChange = 0;



            // Actualizar AURA de los ganadores
            for (const playerCI of winnerPlayerCIs) {
                const player = await PlayerDB.findByPk(playerCI)
                if (player) {
                    const bonusPercentage = await this.calculateTotalBonusPercentage(playerCI, match_id, winnerInscriptionId, winnerAvgAURA, loserAvgAURA);
                    const finalWinnerAuraChange = winnerAURAChange * (1 + bonusPercentage);

                    console.log(`Jugador ${playerCI}: Cambio de AURA base: ${winnerAURAChange.toFixed(2)}, Porcentaje de bonos: ${bonusPercentage.toFixed(2)}, Cambio final: ${finalWinnerAuraChange.toFixed(2)}`);

                    totalWinnerAURAChange += finalWinnerAuraChange;

                    const currentAURA = player.getDataValue("aura") || this.DEFAULT_AURA
                    const newAURA = Math.round(currentAURA + finalWinnerAuraChange)
                    await PlayerDB.update({ aura: newAURA }, { where: { ci: playerCI } })
                    await AuraRecordDB.create({
                        match_id,
                        player_ci: playerCI,
                        aura: newAURA,
                        date: new Date(),
                    } as any);
                }
            }

            let totalLoserAURAChange = 0;
            // Actualizar AURA de los perdedores
            for (const playerCI of loserPlayerCIs) {
                const player = await PlayerDB.findByPk(playerCI)
                if (player) {
                    const currentAURA = player.getDataValue("aura") || this.DEFAULT_AURA
                    const finalLoserAuraChange = loserAURAChange;
                    totalLoserAURAChange += finalLoserAuraChange
                    const newAURA = Math.round(currentAURA + finalLoserAuraChange)
                    await PlayerDB.update({ aura: newAURA }, { where: { ci: playerCI } })
                    await AuraRecordDB.create({
                        match_id,
                        player_ci: playerCI,
                        aura: newAURA,
                        date: new Date(),
                    } as any);
                }
            }

            console.log(
                `[AURA] Actualizado AURA después del partido. Ganador: +${Math.round(totalWinnerAURAChange / winnerPlayerCIs.length)}, Perdedor: ${Math.round(loserAURAChange)}`,
            )
        } catch (error) {
            console.error("[AURA] Error al actualizar AURA después del partido:", error)
            throw error
        }
    }
}

export const auraCalculationService = new AURACalculationService()