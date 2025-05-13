import { TournamentDB } from "../config/sequelize.config"
import type { TournamentInterface } from "../interfaces"

class TournamentService {
  async getAll() {
    try {
      const tournaments = await TournamentDB.findAll()
      return {
        status: 200,
        message: "Torneos obtenidos correctamente",
        data: tournaments,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener torneos",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const tournament = await TournamentDB.findByPk(id)
      if (!tournament) {
        return {
          status: 404,
          message: "Torneo no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Torneo obtenido correctamente",
        data: tournament,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener torneo",
        data: null,
      }
    }
  }

  async create(tournament: TournamentInterface) {
    try {
      const { createdAt, updatedAt, ...tournamentData } = tournament
      const newTournament = await TournamentDB.create(tournamentData as any)
      return {
        status: 201,
        message: "Torneo creado correctamente",
        data: newTournament,
      }
    } catch (error) {
      console.error("Error al crear torneo:", error)
      return {
        status: 500,
        message: "Error al crear torneo",
        data: null,
      }
    }
  }

  async update(id: number, tournament: TournamentInterface) {
    try {
      const existingTournament = await TournamentDB.findByPk(id)
      if (!existingTournament) {
        return {
          status: 404,
          message: "Torneo no encontrado",
          data: null,
        }
      }
      const { createdAt, updatedAt, ...tournamentData } = tournament
      await TournamentDB.update(tournamentData, { where: { id } })
      const updatedTournament = await TournamentDB.findByPk(id)
      return {
        status: 200,
        message: "Torneo actualizado correctamente",
        data: updatedTournament,
      }
    } catch (error) {
      console.error("Error al actualizar torneo:", error)
      return {
        status: 500,
        message: "Error al actualizar torneo",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const tournament = await TournamentDB.findByPk(id)
      if (!tournament) {
        return {
          status: 404,
          message: "Torneo no encontrado",
        }
      }
      await TournamentDB.destroy({ where: { id } })
      return {
        status: 200,
        message: "Torneo eliminado correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar torneo:", error)
      return {
        status: 500,
        message: "Error al eliminar torneo",
      }
    }
  }
}

export const TournamentServices = new TournamentService()
