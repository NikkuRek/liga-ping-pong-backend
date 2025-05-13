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

  async getOne(id: number) {
    try {
      const match = await MatchDB.findByPk(id);
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
      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, ...matchData } = match;
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

  async update(id: number, match: MatchInterface) {
    try {
      const existingMatch = await MatchDB.findByPk(id);
      if (!existingMatch) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        };
      }
      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, ...matchData } = match;
      await MatchDB.update(matchData, { where: { id } });
      const updatedMatch = await MatchDB.findByPk(id);
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

  async delete(id: number) {
    try {
      const match = await MatchDB.findByPk(id);
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        };
      }
      await MatchDB.destroy({ where: { id } });
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