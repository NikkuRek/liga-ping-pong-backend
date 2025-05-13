import { SetsDB, MatchDB } from "../config/sequelize.config"
import type { SetsInterface } from "../interfaces"

class SetsService {
  async getAll() {
    try {
      const sets = await SetsDB.findAll({
        include: [{ model: MatchDB }],
      })
      return {
        status: 200,
        message: "Sets obtenidos correctamente",
        data: sets,
      }
    } catch (error) {
      console.error("Error al obtener sets:", error)
      return {
        status: 500,
        message: "Error al obtener sets",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const set = await SetsDB.findByPk(id, {
        include: [{ model: MatchDB }],
      })
      if (!set) {
        return {
          status: 404,
          message: "Set no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Set obtenido correctamente",
        data: set,
      }
    } catch (error) {
      console.error("Error al obtener set:", error)
      return {
        status: 500,
        message: "Error al obtener set",
        data: null,
      }
    }
  }

  async getByMatch(matchId: number) {
    try {
      const sets = await SetsDB.findAll({
        where: { match_id: matchId },
        order: [["number", "ASC"]],
      })
      return {
        status: 200,
        message: "Sets del partido obtenidos correctamente",
        data: sets,
      }
    } catch (error) {
      console.error("Error al obtener sets del partido:", error)
      return {
        status: 500,
        message: "Error al obtener sets del partido",
        data: null,
      }
    }
  }

  async getByMatchAndNumber(matchId: number, number: number) {
    try {
      const set = await SetsDB.findOne({
        where: { match_id: matchId, number: number },
      })
      return set
    } catch (error) {
      console.error("Error al obtener set por partido y número:", error)
      return null
    }
  }

  async create(set: SetsInterface) {
    try {
      // Verificar si el partido existe
      const match = await MatchDB.findByPk(set.match_id)
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        }
      }

      // Determinar el número del set si no se proporciona
      if (!set.number) {
        const lastSet = await SetsDB.findOne({
          where: { match_id: set.match_id },
          order: [["number", "DESC"]],
        })
        set.number = lastSet ? lastSet.getDataValue("number") + 1 : 1
      }

      const { createdAt, updatedAt, ...setData } = set
      const newSet = await SetsDB.create(setData as any)

      return {
        status: 201,
        message: "Set creado correctamente",
        data: newSet,
      }
    } catch (error) {
      console.error("Error al crear set:", error)
      return {
        status: 500,
        message: "Error al crear set",
        data: null,
      }
    }
  }

  async update(id: number, set: SetsInterface) {
    try {
      const existingSet = await SetsDB.findByPk(id)
      if (!existingSet) {
        return {
          status: 404,
          message: "Set no encontrado",
          data: null,
        }
      }

      const { createdAt, updatedAt, ...setData } = set
      await SetsDB.update(setData, { where: { id_sets: id } })

      const updatedSet = await SetsDB.findByPk(id)

      return {
        status: 200,
        message: "Set actualizado correctamente",
        data: updatedSet,
      }
    } catch (error) {
      console.error("Error al actualizar set:", error)
      return {
        status: 500,
        message: "Error al actualizar set",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const set = await SetsDB.findByPk(id)
      if (!set) {
        return {
          status: 404,
          message: "Set no encontrado",
        }
      }
      await SetsDB.destroy({ where: { id_sets: id } })
      return {
        status: 200,
        message: "Set eliminado correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar set:", error)
      return {
        status: 500,
        message: "Error al eliminar set",
      }
    }
  }
}

export const SetsServices = new SetsService()
