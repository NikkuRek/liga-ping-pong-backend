import { AuraRecordDB, PlayerDB, MatchDB } from "../config/sequelize.config"
import type { AuraRecordInterface } from "../interfaces"
import { Op } from "sequelize"

class AuraRecordService {
  async getAll(limit?: number, page?: number) {
    try {
      const options: any = {
        include: [
          {
            model: PlayerDB,
            attributes: ["first_name", "last_name", "ci"],
          }
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit !== undefined && page !== undefined) {
        options.limit = limit;
        options.offset = (page - 1) * limit;
      }

      const { count, rows } = await AuraRecordDB.findAndCountAll(options);

      // Enriquecer datos al vuelo
      const enrichedData = await Promise.all(rows.map(async (record: any) => {
        const currentRecord = record.toJSON();
        
        // Buscar el registro anterior de este jugador para calcular la diferencia
        const previousRecord = await AuraRecordDB.findOne({
          where: {
            player_ci: currentRecord.player_ci,
            aura_record_id: { [Op.lt]: currentRecord.aura_record_id }
          },
          order: [["aura_record_id", "DESC"]],
          attributes: ["aura"]
        });

        const previousAuraValue = previousRecord ? previousRecord.getDataValue("aura") : 1000;
        const change = currentRecord.aura - previousAuraValue;
        const formattedChange = change >= 0 ? `+${change}` : `${change}`;

        return {
          aura_record_id: currentRecord.aura_record_id,
          match_id: currentRecord.match_id,
          player_ci: currentRecord.player_ci,
          player_name: currentRecord.player ? `${currentRecord.player.first_name} ${currentRecord.player.last_name}` : "N/A",
          previous_aura: previousAuraValue,
          new_aura: currentRecord.aura,
          change_aura: formattedChange,
          date: currentRecord.date,
          createdAt: currentRecord.createdAt,
          updatedAt: currentRecord.updatedAt
        };
      }));

      return {
        status: 200,
        message: "Registros de aura obtenidos correctamente",
        data: enrichedData,
        meta: {
          totalItems: count,
          itemsPerPage: limit || count,
          currentPage: page || 1,
          totalPages: limit ? Math.ceil(count / limit) : 1,
        }
      }
    } catch (error) {
      console.error("Error al obtener registros de aura:", error);
      return {
        status: 500,
        message: "Error al obtener registros de aura",
        data: null,
      }
    }
  }

  async getOne(aura_record_id: number) {
    try {
      const record: any = await AuraRecordDB.findByPk(aura_record_id, {
        include: [{ model: PlayerDB, attributes: ["first_name", "last_name", "ci"] }]
      })
      if (!record) {
        return {
          status: 404,
          message: "Registro no encontrado",
          data: null,
        }
      }

      const currentRecord = record.toJSON();
      const previousRecord = await AuraRecordDB.findOne({
        where: {
          player_ci: currentRecord.player_ci,
          aura_record_id: { [Op.lt]: currentRecord.aura_record_id }
        },
        order: [["aura_record_id", "DESC"]],
        attributes: ["aura"]
      });

      const previousAuraValue = previousRecord ? previousRecord.getDataValue("aura") : 1000;
      const change = currentRecord.aura - previousAuraValue;
      const formattedChange = change >= 0 ? `+${change}` : `${change}`;

      const data = {
        aura_record_id: currentRecord.aura_record_id,
        match_id: currentRecord.match_id,
        player_ci: currentRecord.player_ci,
        player_name: currentRecord.player ? `${currentRecord.player.first_name} ${currentRecord.player.last_name}` : "N/A",
        previous_aura: previousAuraValue,
        new_aura: currentRecord.aura,
        change_aura: formattedChange,
        date: currentRecord.date,
        createdAt: currentRecord.createdAt,
        updatedAt: currentRecord.updatedAt
      };

      return {
        status: 200,
        message: "Registro obtenido correctamente",
        data,
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
      const records = await AuraRecordDB.findAll({
        where: { player_ci },
        include: [{ model: PlayerDB, attributes: ["first_name", "last_name", "ci"] }],
        order: [["aura_record_id", "DESC"]]
      })
      
      const enrichedData = await Promise.all(records.map(async (record: any) => {
        const currentRecord = record.toJSON();
        const previousRecord = await AuraRecordDB.findOne({
          where: {
            player_ci: currentRecord.player_ci,
            aura_record_id: { [Op.lt]: currentRecord.aura_record_id }
          },
          order: [["aura_record_id", "DESC"]],
          attributes: ["aura"]
        });

        const previousAuraValue = previousRecord ? previousRecord.getDataValue("aura") : 1000;
        const change = currentRecord.aura - previousAuraValue;

        return {
          aura_record_id: currentRecord.aura_record_id,
          match_id: currentRecord.match_id,
          player_ci: currentRecord.player_ci,
          player_name: currentRecord.player ? `${currentRecord.player.first_name} ${currentRecord.player.last_name}` : "N/A",
          previous_aura: previousAuraValue,
          new_aura: currentRecord.aura,
          change_aura: change >= 0 ? `+${change}` : `${change}`,
          date: currentRecord.date,
          createdAt: currentRecord.createdAt,
          updatedAt: currentRecord.updatedAt
        };
      }));

      return {
        status: 200,
        message: "Registros del jugador obtenidos correctamente",
        data: enrichedData,
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
      const records = await AuraRecordDB.findAll({
        where: { match_id: matchId },
        include: [{ model: PlayerDB, attributes: ["first_name", "last_name", "ci"] }],
      })

      const enrichedData = await Promise.all(records.map(async (record: any) => {
        const currentRecord = record.toJSON();
        const previousRecord = await AuraRecordDB.findOne({
          where: {
            player_ci: currentRecord.player_ci,
            aura_record_id: { [Op.lt]: currentRecord.aura_record_id }
          },
          order: [["aura_record_id", "DESC"]],
          attributes: ["aura"]
        });

        const previousAuraValue = previousRecord ? previousRecord.getDataValue("aura") : 1000;
        const change = currentRecord.aura - previousAuraValue;

        return {
          aura_record_id: currentRecord.aura_record_id,
          match_id: currentRecord.match_id,
          player_ci: currentRecord.player_ci,
          player_name: currentRecord.player ? `${currentRecord.player.first_name} ${currentRecord.player.last_name}` : "N/A",
          previous_aura: previousAuraValue,
          new_aura: currentRecord.aura,
          change_aura: change >= 0 ? `+${change}` : `${change}`,
          date: currentRecord.date,
          createdAt: currentRecord.createdAt,
          updatedAt: currentRecord.updatedAt
        };
      }));

      return {
        status: 200,
        message: "Registros del partido obtenidos correctamente",
        data: enrichedData,
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
