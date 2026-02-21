import { TournamentDB, InscriptionDB } from "../config/sequelize.config"
import type { TournamentInterface } from "../interfaces"
import { Op } from "sequelize"

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
      // Excluir campos no insertables
      const {
        tournament_id,
        createdAt,
        updatedAt,
        ...tournamentData
      } = tournament

      // Asegúrate de que los campos obligatorios estén presentes
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
      const {
        tournament_id,
        createdAt,
        updatedAt,
        ...tournamentData
      } = tournament

      await TournamentDB.update(tournamentData, { where: { tournament_id: id } })
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
      await TournamentDB.destroy({ where: { tournament_id: id } })
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

  async getTournamentsByPlayerCI(player_ci: string) {
    try {
      // 1. Buscar todas las inscripciones del jugador
      const inscriptions = await InscriptionDB.findAll({
        where: { player_ci },
        attributes: ["tournament_id"],
      })

      if (inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para este jugador",
          data: [],
        }
      }

      // 2. Extraer los IDs de los torneos
      const tournamentIds = inscriptions.map((inscription) =>
        inscription.getDataValue("tournament_id")
      )

      // 3. Buscar los torneos únicos
      const tournaments = await TournamentDB.findAll({
        where: {
          tournament_id: { [Op.in]: tournamentIds },
        },
      })

      return {
        status: 200,
        message: "Torneos obtenidos correctamente",
        data: tournaments,
      }
    } catch (error) {
      console.error("Error al obtener torneos por CI del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener torneos por CI del jugador",
        data: null,
      }
    }
  }

  async patch(id: number, tournamentData: Partial<TournamentInterface>) {
    try {
      const tournament = await TournamentDB.findByPk(id);
      if (!tournament) {
        return { status: 404, message: "Torneo no encontrado" };
      }

      const { tournament_id, createdAt, updatedAt, ...dataToUpdate } = tournamentData as any;
      await TournamentDB.update(dataToUpdate, { where: { tournament_id: id } });
      
      const updatedTournament = await TournamentDB.findByPk(id);
      return {
        status: 200,
        message: "Torneo actualizado parcialmente",
        data: updatedTournament,
      }
    } catch (error) {
      console.error("Error al parchear torneo:", error);
      return { status: 500, message: "Error al actualizar torneo" };
    }
  }
}

export const TournamentServices = new TournamentService()
