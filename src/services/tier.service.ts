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
        message: "Error al obtener niveles",
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
        message: "Error al obtener nivel",
        data: null,
      }
    }
  }

  async create(tier: TierInterface) {
    try {
      // Usar directamente los datos del tier sin intentar desestructurar createdAt/updatedAt
      const newTier = await TierDB.create(tier as any)
      return {
        status: 201,
        message: "Nivel creado correctamente",
        data: newTier,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear nivel",
        data: null,
      }
    }
  }

  async update(id: number, updateData: { range?: string }) {
    try {
      const existingTier = await TierDB.findByPk(id)

      if (!existingTier) {
        return {
          status: 404,
          message: "Nivel no encontrado",
          data: null,
        }
      }

      // Usar directamente los datos de actualización sin intentar desestructurar createdAt/updatedAt
      await existingTier.update(updateData)

      const updatedTier = await TierDB.findByPk(id)

      return {
        status: 200,
        message: "Nivel actualizado correctamente",
        data: updatedTier,
      }
    } catch (error) {
      console.error("Error al actualizar nivel (servicio):", error)
      return {
        status: 500,
        message: "Error al actualizar nivel",
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
