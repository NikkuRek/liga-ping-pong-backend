import { MatchDB, SetsDB, AuraRecordDB } from "../config/sequelize.config"
import type { MatchInterface } from "../interfaces"
import { auraCalculationService } from "../middlewares/aura-calculator.middlewares"

// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\services\match.service.ts

class MatchService {
  async getAll() {
    try {
      // Modifica esta línea para incluir los sets
      const matches = await MatchDB.findAll({
        include: { model: SetsDB },
      })
      return {
        status: 200,
        message: "Partidos obtenidos correctamente",
        data: matches,
      }
    } catch (error) {
      console.error("Error al obtener partidos:", error)
      return {
        status: 500,
        message: "Error al obtener partidos",
        data: null,
      }
    }
  }

  // También deberías hacer esto en el método getOne para que también muestre los sets
  async getOne(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id, {
        include: { model: SetsDB },
      })
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Partido obtenido correctamente",
        data: match,
      }
    } catch (error) {
      console.error("Error al obtener partido:", error)
      return {
        status: 500,
        message: "Error al obtener partido",
        data: null,
      }
    }
  }

  async create(match: MatchInterface) {
    try {
      // No permitir establecer manualmente createdAt o updatedAt
      const { createdAt, updatedAt, match_id, ...matchData } = match
      const newMatch = await MatchDB.create(matchData as any)
      return {
        status: 201,
        message: "Partido creado correctamente",
        data: newMatch,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear partido",
        data: null,
      }
    }
  }

  async update(match_id: number, match: MatchInterface) {
    try {
      const existingMatch = await MatchDB.findByPk(match_id)
      if (!existingMatch) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        }
      }

      const previousWinner = existingMatch.getDataValue("winner_inscription_id")

      // No permitir establecer manualmente createdAt o updatedAt o match_id
      const { createdAt, updatedAt, match_id: _, ...matchData } = match

      if (match.winner_inscription_id && !previousWinner) {
        ;(matchData as any).status = "Finalizado"
      }

      await MatchDB.update(matchData, { where: { match_id } })
      const updatedMatch = await MatchDB.findByPk(match_id)

      //  --------------------------------------------------------------------------------------------
      if (match.winner_inscription_id && !previousWinner) {
        try {
          const inscription1_id = existingMatch.getDataValue("inscription1_id")
          const inscription2_id = existingMatch.getDataValue("inscription2_id")
          const winner_id = match.winner_inscription_id
          const loser_id = winner_id === inscription1_id ? inscription2_id : inscription1_id

          await auraCalculationService.updateAURAAfterMatch(winner_id, loser_id, match_id)

        } catch (auraError) {
          console.error("[AURA] Error calculating AURA, but match update succeeded:", auraError)
        }
      }
      //  --------------------------------------------------------------------------------------------

      return {
        status: 200,
        message: "Partido actualizado correctamente",
        data: updatedMatch,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar partido",
        data: null,
      }
    }
  }

  async delete(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id)
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        }
      }
      await MatchDB.destroy({ where: { match_id } })
      return {
        status: 200,
        message: "Partido eliminado correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar partido",
      }
    }
  }

  async deleteCascade(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id)
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        }
      }

      // 1. Eliminar los registros de aura asociados al partido
      await AuraRecordDB.destroy({ where: { match_id } })

      // 2. Eliminar los sets asociados al partido
      await SetsDB.destroy({ where: { match_id } })

      // 3. Eliminar el partido
      await MatchDB.destroy({ where: { match_id } })

      return {
        status: 200,
        message: "Partido y sus datos asociados eliminados correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar partido en cascada:", error)
      return {
        status: 500,
        message: "Error al eliminar partido en cascada",
      }
    }
  }
}

export const MatchServices = new MatchService()
