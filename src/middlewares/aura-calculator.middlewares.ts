// import { InscriptionDB, PlayerDB, TeamDB } from "../config/sequelize.config"

// export class AURACalculationService {
//     private getKFactor(avgAURA: number): number {
//         if (avgAURA <= 1000) return 40
//         if (avgAURA >= 1500) return 20
//         // Interpolación lineal entre 1000 y 1500
//         return 40 - ((avgAURA - 1000) * (20) / 500)
//     }
//     private readonly DEFAULT_AURA = 1000

//     private calculateExpectedScore(auraA: number, auraB: number): number {
//         return 1 / (1 + Math.pow(10, (auraB - auraA) / 400))
//     }

//     private calculateNewAURA(currentAURA: number, expectedScore: number, actualScore: number, avgAURA: number): number {
//         const kFactor = this.getKFactor(avgAURA)
//         return Math.round(currentAURA + kFactor * (actualScore - expectedScore))
//     }

//     private async getPlayersFromInscription(inscriptionId: number): Promise<string[]> {
//         const inscription = await InscriptionDB.findByPk(inscriptionId)
//         if (!inscription) {
//             throw new Error(`Inscripción con ID ${inscriptionId} no encontrada`)
//         }

//         if (inscription.getDataValue("player_ci")) {
//             return [inscription.getDataValue("player_ci")]
//         }

//         if (inscription.getDataValue("team_id")) {
//             const team = await TeamDB.findByPk(inscription.getDataValue("team_id"))
//             if (!team) {
//                 throw new Error(`Equipo con ID ${inscription.getDataValue("team_id")} no encontrado`)
//             }
//             return [team.getDataValue("player1_ci"), team.getDataValue("player2_ci")]
//         }

//         throw new Error(`Inscripción ${inscriptionId} no tiene jugador ni equipo asociado`)
//     }

//     private async getAverageAURA(playerCIs: string[]): Promise<number> {
//         const players = await PlayerDB.findAll({
//             where: { ci: playerCIs },
//         })

//         if (players.length !== playerCIs.length) {
//             throw new Error("No se encontraron todos los jugadores especificados")
//         }

//         const totalAURA = players.reduce((sum, player) => {
//             const aura = player.getDataValue("aura") || this.DEFAULT_AURA
//             return sum + aura
//         }, 0)

//         return totalAURA / players.length
//     }

//     async updateAURAAfterMatch(winnerInscriptionId: number, loserInscriptionId: number): Promise<void> {
//         try {
//             // Obtener jugadores de ambas inscripciones
//             const winnerPlayerCIs = await this.getPlayersFromInscription(winnerInscriptionId)
//             const loserPlayerCIs = await this.getPlayersFromInscription(loserInscriptionId)

//             // Calcular AURA promedio de cada lado
//             const winnerAvgAURA = await this.getAverageAURA(winnerPlayerCIs)
//             const loserAvgAURA = await this.getAverageAURA(loserPlayerCIs)

//             // Calcular probabilidades esperadas
//             const winnerExpectedScore = this.calculateExpectedScore(winnerAvgAURA, loserAvgAURA)
//             const loserExpectedScore = this.calculateExpectedScore(loserAvgAURA, winnerAvgAURA)
//             // Calcular cambios de AURA usando K-factor dinámico
//             const kFactor = this.getKFactor((winnerAvgAURA + loserAvgAURA) / 2)
//             const winnerAURAChange = kFactor * (1 - winnerExpectedScore)
//             const loserAURAChange = kFactor * (0 - loserExpectedScore)

//             // Actualizar AURA de los ganadores
//             for (const playerCI of winnerPlayerCIs) {
//                 const player = await PlayerDB.findByPk(playerCI)
//                 if (player) {
//                     const currentAURA = player.getDataValue("aura") || this.DEFAULT_AURA
//                     const newAURA = Math.round(currentAURA + winnerAURAChange)
//                     await PlayerDB.update({ aura: newAURA }, { where: { ci: playerCI } })
//                 }
//             }

//             // Actualizar AURA de los perdedores
//             for (const playerCI of loserPlayerCIs) {
//                 const player = await PlayerDB.findByPk(playerCI)
//                 if (player) {
//                     const currentAURA = player.getDataValue("aura") || this.DEFAULT_AURA
//                     const newAURA = Math.round(currentAURA + loserAURAChange)
//                     await PlayerDB.update({ aura: newAURA }, { where: { ci: playerCI } })
//                 }
//             }

//             console.log(
//                 `[AURA] Actualizado AURA después del partido. Ganador: +${Math.round(winnerAURAChange)}, Perdedor: ${Math.round(loserAURAChange)}`,
//             )
//         } catch (error) {
//             console.error("[AURA] Error al actualizar AURA después del partido:", error)
//             throw error
//         }
//     }
// }

// export const auraCalculationService = new AURACalculationService()
