import { TierDB } from "../config/sequelize.config"
import type { TierInterface } from "../interfaces"

class TierService {
  async getAll() {
    try {
      const tier = await TierDB.findAll()
      return {
        status: 200,
        message: "Niveles obtenidos correctamente",
        data: tier,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener carreras",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const tier = await TierDB.findByPk(id)
      if (!tier) {
        return {
          status: 404,
          message: "Nivel no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Nivel obtenido correctamente",
        data: tier,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener carrera",
        data: null,
      }
    }
  }

  async create(tier: TierInterface) {
    try {
      const newTier = await TierDB.create(tier as any)
      return {
        status: 201,
        message: "Nivel creado correctamente",
        data: newTier,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear carrera",
        data: null,
      }
    }
  }

  async update(id: number, tier: TierInterface) {
    try {
      const existingTier = await TierDB.findByPk(id)
      if (!existingTier) {
        return {
          status: 404,
          message: "Nivel no encontrado",
          data: null,
        }
      }
      await TierDB.update(tier, { where: { id } })
      const updatedTier = await TierDB.findByPk(id)
      return {
        status: 200,
        message: "Nivel actualizado correctamente",
        data: updatedTier,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar carrera",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const tier = await TierDB.findByPk(id)
      if (!tier) {
        return {
          status: 404,
          message: "Nivel no encontrado",
        }
      }
      await TierDB.destroy({ where: { id } })
      return {
        status: 200,
        message: "Nivel eliminado correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar nivel",
      }
    }
  }
}

export const TierServices = new TierService()
