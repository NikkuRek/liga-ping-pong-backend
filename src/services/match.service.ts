import { MatchDB } from "../config/sequelize.config";
import type { MatchInterface } from "../interfaces";

// filepath: c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\src\services\match.service.ts

class MatchService {
  async getAll() {
    try {
      const matches = await MatchDB.findAll();
      return {
        status: 200,
        message: "Partidos obtenidos correctamente",
        data: matches,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener partidos",
        data: null,
      };
    }
  }

  async getOne(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id);
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        };
      }
      return {
        status: 200,
        message: "Partido obtenido correctamente",
        data: match,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener partido",
        data: null,
      };
    }
  }

  async create(match: MatchInterface) {
    try {
      // No permitir establecer manualmente createdAt o updatedAt
      const { createdAt, updatedAt, match_id, ...matchData } = match;
      const newMatch = await MatchDB.create(matchData as any);
      return {
        status: 201,
        message: "Partido creado correctamente",
        data: newMatch,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear partido",
        data: null,
      };
    }
  }

  async update(match_id: number, match: MatchInterface) {
    try {
      const existingMatch = await MatchDB.findByPk(match_id);
      if (!existingMatch) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        };
      }
      // No permitir establecer manualmente createdAt o updatedAt o match_id
      const { createdAt, updatedAt, match_id: _, ...matchData } = match;
      await MatchDB.update(matchData, { where: { match_id } });
      const updatedMatch = await MatchDB.findByPk(match_id);
      return {
        status: 200,
        message: "Partido actualizado correctamente",
        data: updatedMatch,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar partido",
        data: null,
      };
    }
  }

  async delete(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id);
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        };
      }
      await MatchDB.destroy({ where: { match_id } });
      return {
        status: 200,
        message: "Partido eliminado correctamente",
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar partido",
      };
    }
  }
}

export const MatchServices = new MatchService();