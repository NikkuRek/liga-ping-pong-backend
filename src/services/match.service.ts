import { MatchDB, SetsDB, AuraRecordDB, PlayerDB } from "../config/sequelize.config"
import type { MatchInterface } from "../interfaces"
import { auraCalculationService } from "../middlewares/aura-calculator.middlewares"
import { Op } from "sequelize"

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

      // 1. Revertir los cambios de aura antes de eliminar los registros
      await this.revertAuraChanges(match_id)

      // 2. Eliminar los registros de aura asociados al partido
      await AuraRecordDB.destroy({ where: { match_id } })

      // 3. Eliminar los sets asociados al partido
      await SetsDB.destroy({ where: { match_id } })

      // 4. Eliminar el partido
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

  private async revertAuraChanges(match_id: number): Promise<void> {
    try {
      // Obtener los aura-records del partido a eliminar
      const auraRecords = await AuraRecordDB.findAll({
        where: { match_id },
        order: [["aura_record_id", "ASC"]],
      })

      if (auraRecords.length === 0) {
        console.log(`[AURA REVERT] No hay registros de aura para el partido ${match_id}`)
        return
      }

      // Para cada jugador en los aura-records
      for (const record of auraRecords) {
        const player_ci = record.getDataValue("player_ci")
        const aura_en_ese_partido = record.getDataValue("aura")
        const aura_record_id = record.getDataValue("aura_record_id")

        // Buscar el aura-record ANTERIOR del mismo jugador
        const previousRecord = await AuraRecordDB.findOne({
          where: {
            player_ci,
            aura_record_id: { [Op.lt]: aura_record_id },
          },
          order: [["aura_record_id", "DESC"]],
        })

        let aura_anterior: number

        if (previousRecord) {
          // Si existe un registro anterior, usar ese aura
          aura_anterior = previousRecord.getDataValue("aura")
        } else {
          // Si no existe registro anterior, este es el primer partido del jugador
          // Necesitamos calcular el aura que tenía ANTES de este partido
          // Como el aura_en_ese_partido es el resultado después del partido,
          // y no tenemos el anterior, debemos usar una lógica diferente
          
          // Obtener el aura actual del jugador
          const player = await PlayerDB.findByPk(player_ci)
          if (!player) {
            console.error(`[AURA REVERT] Jugador ${player_ci} no encontrado`)
            continue
          }
          
          const aura_actual = player.getDataValue("aura") || 1000
          
          // Si no hay registro anterior, calculamos el aura_anterior restando el cambio
          // del aura actual. El cambio es: aura_en_ese_partido - aura_anterior
          // Entonces: aura_anterior = aura_actual - (aura_en_ese_partido - aura_anterior)
          // Simplificando: necesitamos el aura que tenía antes del partido
          // Como es el primer partido, asumimos que empezó con el aura por defecto
          // y el cambio fue: aura_en_ese_partido - aura_default
          
          // Pero espera, si es el primer partido y no hay más partidos después,
          // entonces aura_actual == aura_en_ese_partido
          // Si hay partidos después, aura_actual != aura_en_ese_partido
          
          // La mejor aproximación es: si no hay registro anterior, 
          // el aura_anterior es el aura por defecto del sistema (1000)
          aura_anterior = 1000
        }

        // Calcular el cambio que produjo ese partido
        const cambio_de_aura = aura_en_ese_partido - aura_anterior

        // Obtener el aura actual del jugador
        const player = await PlayerDB.findByPk(player_ci)
        if (!player) {
          console.error(`[AURA REVERT] Jugador ${player_ci} no encontrado`)
          continue
        }

        const aura_actual = player.getDataValue("aura") || 1000

        // Revertir el cambio
        const nuevo_aura = aura_actual - cambio_de_aura

        // Actualizar el jugador
        await PlayerDB.update({ aura: nuevo_aura }, { where: { ci: player_ci } })

        console.log(
          `[AURA REVERT] Jugador ${player_ci}: Aura anterior=${aura_anterior}, Aura en partido=${aura_en_ese_partido}, Cambio=${cambio_de_aura}, Aura actual=${aura_actual}, Nuevo aura=${nuevo_aura}`,
        )
      }
    } catch (error) {
      console.error("[AURA REVERT] Error al revertir cambios de aura:", error)
      throw error
    }
  }
}

export const MatchServices = new MatchService()
