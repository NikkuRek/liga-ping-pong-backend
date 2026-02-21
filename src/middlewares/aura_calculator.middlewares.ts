import { InscriptionDB, PlayerDB, TeamDB, AuraRecordDB, MatchDB, SetsDB, db } from "../config/sequelize.config";
import { Op, Transaction } from "sequelize";

interface AuraRecordCreation {
    match_id: number;
    player_ci: string;
    aura: number;
    date: Date;
}

export class AURACalculationService {
    private async getKFactor(AvgAura: number, playerCIs: string[]): Promise<number> {
        // 2.2 Bonus para novatos: K=60 en los primeros 15 partidos
        let totalMatches = 0;
        for (const ci of playerCIs) {
            totalMatches += await this.getPlayerMatchCount(ci);
        }
        const avgMatches = totalMatches / playerCIs.length;

        if (avgMatches < 15) {
            return 60;
        }

        if (AvgAura < 1200) {
            return 45; // K alto para bajo (1000 - 1199)
        } else if (AvgAura >= 1200 && AvgAura < 1400) {
            return 35; // K intermedio para medio-bajo (1200 - 1399)
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

    private async getPlayerMatchCount(playerCI: string): Promise<number> {
        const inscriptions = await InscriptionDB.findAll({
            where: { player_ci: playerCI },
            attributes: ['inscription_id']
        });
        const inscriptionIds = inscriptions.map(ins => ins.getDataValue('inscription_id'));
        
        // Optimización: Solo buscamos hasta 20 partidos para verificar si es novato (< 15)
        const matches = await MatchDB.findAll({
            where: {
                [Op.or]: [
                    { inscription1_id: { [Op.in]: inscriptionIds } },
                    { inscription2_id: { [Op.in]: inscriptionIds } }
                ],
                status: 'Finalizado'
            },
            attributes: ['match_id'],
            limit: 20
        });
        
        return matches.length;
    }

    private async applyInactivityDecay(playerCI: string, transaction: Transaction): Promise<number> {
        // Obtenemos el jugador y verificamos si está activo (status: true)
        const player = await PlayerDB.findByPk(playerCI, { transaction });
        if (!player || player.getDataValue("status") === false) {
            return 0; // No penalizamos si el jugador está marcado como inactivo (false) o no existe
        }

        const lastRecord = await AuraRecordDB.findOne({
            where: { player_ci: playerCI },
            order: [['createdAt', 'DESC']],
            transaction
        });

        if (!lastRecord) return 0;

        const lastMatchDate = new Date(lastRecord.getDataValue('createdAt'));
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - lastMatchDate.getTime()) / (1000 * 3600 * 24));

        if (diffInDays >= 7) {
            const weeksInactive = Math.floor(diffInDays / 7);
            const penalty = weeksInactive * 5;
            
            if (penalty > 0) {
                const currentAura = player.getDataValue("aura") || this.DEFAULT_AURA;
                const newAura = Math.max(800, currentAura - penalty);
                await PlayerDB.update({ aura: newAura }, { where: { ci: playerCI }, transaction });
                
                const recordData: AuraRecordCreation = {
                    match_id: 0, 
                    player_ci: playerCI,
                    aura: newAura,
                    date: new Date(),
                };
                await AuraRecordDB.create(recordData as any, { transaction });
                
                return penalty;
            }
        }
        return 0;
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

        if (players.length === 0) return this.DEFAULT_AURA;

        const totalAURA = players.reduce((sum, player) => {
            const aura = player.getDataValue("aura") || this.DEFAULT_AURA
            return sum + aura
        }, 0)

        return totalAURA / players.length
    }

    private async getScoreDifferenceBonus(match_id: number, winnerInscriptionId: number): Promise<number> {
        const match = await MatchDB.findByPk(match_id);
        if (!match) return 0;

        const inscription1Id = match.getDataValue("inscription1_id");
        const inscription2Id = match.getDataValue("inscription2_id");

        const sets = await SetsDB.findAll({ where: { match_id } });
        if (sets.length === 0) return 0;

        let winnerTotalScore = 0;
        let loserTotalScore = 0;

        for (const set of sets) {
            const score1 = Number(set.getDataValue("score_participant1")); 
            const score2 = Number(set.getDataValue("score_participant2"));
            
            if (isNaN(score1) || isNaN(score2)) continue;

            if (inscription1Id === winnerInscriptionId) {
                winnerTotalScore += score1;
                loserTotalScore += score2;
            } else if (inscription2Id === winnerInscriptionId) {
                winnerTotalScore += score2;
                loserTotalScore += score1;
            }
        }
        
        const pointDifference = winnerTotalScore - loserTotalScore;

        if (pointDifference >= 12) return 0.08;
        if (pointDifference >= 9) return 0.06;
        if (pointDifference >= 6) return 0.04;

        return 0;
    }

    private async getCrushingVictoryBonus(match_id: number, winnerInscriptionId: number): Promise<number> {
        const match = await MatchDB.findByPk(match_id);
        if (!match) return 0;

        const sets = await SetsDB.findAll({ where: { match_id } });
        let hasCrushingSet = false;

        const inscription1Id = match.getDataValue("inscription1_id");

        for (const set of sets) {
            const score1 = Number(set.getDataValue("score_participant1"));
            const score2 = Number(set.getDataValue("score_participant2"));
            
            const winnerScore = inscription1Id === winnerInscriptionId ? score1 : score2;
            const loserScore = inscription1Id === winnerInscriptionId ? score2 : score1;

            if (winnerScore >= 11 && loserScore <= 5) {
                hasCrushingSet = true;
                break;
            }
        }

        return hasCrushingSet ? 0.05 : 0;
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
            order: [['match_datetime', 'DESC']],
            limit: 15 // Optimización: no traer todo el historial
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

        if (streak >= 7) return 0.12;
        if (streak >= 5) return 0.08;
        if (streak >= 3) return 0.04;

        return 0;
    }

    private async getTournamentMatchBonus(match_id: number): Promise<number> {
        const match = await MatchDB.findByPk(match_id);
        if (!match) return 0;

        const round = match.getDataValue("round");
        switch (round) {
            case "Final": return 0.15;
            case "Semifinal": return 0.12;
            case "Ronda 3":
            case "Cuartos de Final": return 0.10;
            case "Ronda 2":
            case "Octavos de Final": return 0.08;
            case "Ronda 1":
            case "Repechaje": return 0.06;
            case "Liga": return 0.04;
            default:
                if (round !== "Libre" && round !== "Propuesto") return 0.02;
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
                match_datetime: { [Op.gte]: sevenDaysAgo },
                status: 'Finalizado'
            }
        });

        if (matchCount >= 10) return 0.08;
        if (matchCount >= 7) return 0.05;
        if (matchCount >= 5) return 0.02;

        return 0;
    }

    private getDirectRivalsBonus(winnerAvgAURA: number, loserAvgAURA: number): number {
        const auraDifference = Math.abs(winnerAvgAURA - loserAvgAURA);
        if (auraDifference <= 20) return 0.09;
        if (auraDifference <= 40) return 0.06;
        if (auraDifference <= 60) return 0.03;
        return 0;
    }

    private async calculateTotalBonusPercentage(playerCI: string, match_id: number, winnerInscriptionId: number, winnerAvgAURA: number, loserAvgAURA: number): Promise<number> {
        const results = await Promise.all([
            this.getScoreDifferenceBonus(match_id, winnerInscriptionId),
            this.getCrushingVictoryBonus(match_id, winnerInscriptionId),
            this.getWinningStreakBonus(playerCI),
            this.getTournamentMatchBonus(match_id),
            this.getConsistencyStreakBonus(playerCI),
            this.getDirectRivalsBonus(winnerAvgAURA, loserAvgAURA)
        ]);

        const totalBonus = results.reduce((sum, val) => sum + val, 0);
        return Math.min(totalBonus, 0.3); // Max Bonus 30%
    }

    async updateAURAAfterMatch(winnerInscriptionId: number, loserInscriptionId: number, match_id: number): Promise<void> {
        const t = await db.transaction();
        try {
            const winnerPlayerCIs = await this.getPlayersFromInscription(winnerInscriptionId)
            const loserPlayerCIs = await this.getPlayersFromInscription(loserInscriptionId)

            // 2.1 Aplicar Inactivity Decay antes del cálculo si corresponde
            for (const ci of [...winnerPlayerCIs, ...loserPlayerCIs]) {
                await this.applyInactivityDecay(ci, t);
            }

            const winnerAvgAURA = await this.getAverageAURA(winnerPlayerCIs)
            const loserAvgAURA = await this.getAverageAURA(loserPlayerCIs)

            const winnerExpectedScore = this.calculateExpectedScore(winnerAvgAURA, loserAvgAURA)
            const loserExpectedScore = this.calculateExpectedScore(loserAvgAURA, winnerAvgAURA)

            const kFactor = await this.getKFactor((winnerAvgAURA + loserAvgAURA) / 2, [...winnerPlayerCIs, ...loserPlayerCIs])
            const winnerAURAChange = kFactor * (1 - winnerExpectedScore)
            const loserAURAChange = kFactor * (0 - loserExpectedScore)

            // Actualizar ganadores
            for (const playerCI of winnerPlayerCIs) {
                const player = await PlayerDB.findByPk(playerCI, { transaction: t })
                if (player) {
                    const bonusPercentage = await this.calculateTotalBonusPercentage(playerCI, match_id, winnerInscriptionId, winnerAvgAURA, loserAvgAURA);
                    const finalChange = Math.round(winnerAURAChange * (1 + bonusPercentage));

                    const currentAURA = player.getDataValue("aura") || this.DEFAULT_AURA
                    const newAURA = currentAURA + finalChange
                    
                    await PlayerDB.update({ aura: newAURA }, { where: { ci: playerCI }, transaction: t })
                    const recordData: AuraRecordCreation = {
                        match_id,
                        player_ci: playerCI,
                        aura: newAURA,
                        date: new Date(),
                    };
                    await AuraRecordDB.create(recordData as any, { transaction: t });
                }
            }

            // Actualizar perdedores
            for (const playerCI of loserPlayerCIs) {
                const player = await PlayerDB.findByPk(playerCI, { transaction: t })
                if (player) {
                    const finalChange = Math.round(loserAURAChange);
                    const currentAURA = player.getDataValue("aura") || this.DEFAULT_AURA
                    const newAURA = Math.max(800, currentAURA + finalChange)

                    await PlayerDB.update({ aura: newAURA }, { where: { ci: playerCI }, transaction: t })
                    const recordData: AuraRecordCreation = {
                        match_id,
                        player_ci: playerCI,
                        aura: newAURA,
                        date: new Date(),
                    };
                    await AuraRecordDB.create(recordData as any, { transaction: t });
                }
            }

            await t.commit();
            console.log(`[AURA] Partido ${match_id} procesado con éxito.`);
        } catch (error) {
            await t.rollback();
            console.error("[AURA] Error al actualizar AURA:", error)
            throw error
        }
    }

    async penalizeAbandono(playerCI: string): Promise<void> {
        const t = await db.transaction();
        try {
            const player = await PlayerDB.findByPk(playerCI, { transaction: t });
            if (!player) {
                await t.rollback();
                return;
            }

            const currentAura = player.getDataValue("aura") || this.DEFAULT_AURA;
            const penalty = 15;
            const newAura = Math.max(800, currentAura - penalty);

            await PlayerDB.update({ aura: newAura }, { where: { ci: playerCI }, transaction: t });
            const recordData: AuraRecordCreation = {
                match_id: 0, 
                player_ci: playerCI,
                aura: newAura,
                date: new Date(),
            };
            await AuraRecordDB.create(recordData as any, { transaction: t });
            
            await t.commit();
            console.log(`[AURA PENALTY] Jugador ${playerCI} penalizado por abandono.`);
        } catch (error) {
            await t.rollback();
            console.error("[AURA] Error en penalización por abandono:", error);
        }
    }
}

export const auraCalculationService = new AURACalculationService()
