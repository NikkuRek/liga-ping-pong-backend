import { AuraRecordDB, PlayerDB, MatchDB } from "../config/sequelize.config"
import type { AuraRecordInterface } from "../interfaces"

class AuraRecordService {
  async getAll() {
    try {
      const aura_records = await AuraRecordDB.findAll()
      return {
        status: 200,
        message: "Registros de aura obtenidas correctamente",
        data: aura_records,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener registros de aura",
        data: null,
      }
    }
  }

  async getOne(aura_record_id: number) {
    try {
      const aura_record = await AuraRecordDB.findByPk(aura_record_id)
      if (!aura_record) {
        return {
          status: 404,
          message: "Registro no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Registro obtenido correctamente",
        data: aura_record,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener el registro",
        data: null,
      }
    }
  }

  async getByPlayer(player_ci: string) {
      try {
        const AuraRecords = await AuraRecordDB.findAll({
          where: { player_ci },
          include: [
            { model: PlayerDB }
          ],
        })
        if (!AuraRecords || AuraRecords.length === 0) {
          return {
            status: 404,
            message: "No se encontraron registros para el jugador",
            data: null,
          }
        }
        return {
          status: 200,
          message: "Registros del jugador obtenidos correctamente",
          data: AuraRecords,
        }
      } catch (error) {
        console.error("Error al obtener los registros del jugador:", error)
        return {
          status: 500,
          message: "Error al obtener los registros del jugador",
          data: null,
        }
      }
    }

  async getByMatch(matchId: number) {
      try {
        const sets = await AuraRecordDB.findAll({
          where: { match_id: matchId },
          include: [
            { model: MatchDB }
          ],
        })
        return {
          status: 200,
          message: "Registros del partido obtenidos correctamente",
          data: sets,
        }
      } catch (error) {
        console.error("Error al obtener los registros del partido:", error)
        return {
          status: 500,
          message: "Error al obtener los registros del partido",
          data: null,
        }
      }
    }

  async create(aura_record: AuraRecordInterface) {
    try {
      const player = await PlayerDB.findByPk(aura_record.player_ci)
      if (!player) {
        return {
          status: 404,
          message: `Jugador con ci ${aura_record.player_ci} no encontrado`,
          data: null,
        }
      }

      const match = await MatchDB.findByPk(aura_record.match_id)
      if (!match) {
        return {
          status: 404,
          message: `Partido con id ${aura_record.match_id} no encontrado`,
          data: null,
        }
      }

      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, aura_record_id, ...aura_recordData } = aura_record
      const newAuraRecord = await AuraRecordDB.create(aura_recordData as any)
      return {
        status: 201,
        message: "Registro creado correctamente",
        data: newAuraRecord,
      }
    } catch (error) {
      console.error("Error al crear el registro:", error)
      return {
        status: 500,
        message: "Error al crear el registro",
        data: null,
      }
    }
  }

  async update(aura_record_id: number, aura_record: AuraRecordInterface) {
    try {
      const existingAuraRecord = await AuraRecordDB.findByPk(aura_record_id)
      if (!existingAuraRecord) {
        return {
          status: 404,
          message: "Registro no encontrado",
          data: null,
        }
      }
      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, aura_record_id: _, ...aura_recordData } = aura_record
      await AuraRecordDB.update(aura_recordData, { where: { aura_record_id } })
      const updatedAuraRecord = await AuraRecordDB.findByPk(aura_record_id)
      return {
        status: 200,
        message: "Registro actualizado correctamente",
        data: updatedAuraRecord,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar el registro",
        data: null,
      }
    }
  }

  async delete(aura_record_id: number) {
    try {
      const aura_record = await AuraRecordDB.findByPk(aura_record_id)
      if (!aura_record) {
        return {
          status: 404,
          message: "Registro no encontrado",
        }
      }
      await AuraRecordDB.destroy({ where: { aura_record_id } })
      return {
        status: 200,
        message: "Registro eliminado correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar el registro",
      }
    }
  }
}

export const AuraRecordServices = new AuraRecordService()
