import { InscriptionDB, PlayerDB, TournamentDB, TeamDB } from "../config/sequelize.config"
import type { InscriptionInterface } from "../interfaces"

class InscriptionService {
  async getAll() {
    try {
      const inscriptions = await InscriptionDB.findAll({
        include: [
          { model: PlayerDB },
          { model: TeamDB },
          { model: TournamentDB }
        ],
      })
      return {
        status: 200,
        message: "Inscripciones obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones",
        data: null,
      }
    }
  }

  async getOne(inscription_id: number) {
    try {
      const inscription = await InscriptionDB.findByPk(inscription_id, {
        include: [
          { model: PlayerDB },
          { model: TeamDB },
          { model: TournamentDB }
        ],
      })
      if (!inscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Inscripción obtenida correctamente",
        data: inscription,
      }
    } catch (error) {
      console.error("Error al obtener inscripción:", error)
      return {
        status: 500,
        message: "Error al obtener inscripción",
        data: null,
      }
    }
  }

  async getByTournament(tournament_id: number) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { tournament_id },
        include: [
          { model: PlayerDB },
          { model: TeamDB }
        ],
      })
      if (!inscriptions || inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para el torneo",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Inscripciones del torneo obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones del torneo:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones del torneo",
        data: null,
      }
    }
  }

  async getByPlayer(player_ci: string) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { player_ci },
        include: [
          { model: TournamentDB },
          { model: TeamDB }
        ],
      })
      if (!inscriptions || inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para el jugador",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Inscripciones del jugador obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones del jugador",
        data: null,
      }
    }
  }

  async getByTeam(team_id: number) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { team_id },
        include: [
          { model: TournamentDB },
          { model: TeamDB }
        ],
      })
      if (!inscriptions || inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para el equipo",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Inscripciones del equipo obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones del equipo:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones del equipo",
        data: null,
      }
    }
  }

  async create(inscription: InscriptionInterface) {
    try {
      const { createdAt, updatedAt, ...inscriptionData } = inscription

      // Validación: solo uno de player_ci o team_id debe estar presente
      if (
        (!inscriptionData.player_ci && !inscriptionData.team_id) ||
        (inscriptionData.player_ci && inscriptionData.team_id)
      ) {
        return {
          status: 400,
          message: "Una inscripción debe ser para un jugador o para un equipo, pero no para ambos o ninguno.",
          data: null,
        }
      }

      // Validar duplicados según tipo de inscripción
      let duplicateInscription = null
      if (inscriptionData.player_ci) {
        duplicateInscription = await InscriptionDB.findOne({
          where: {
            tournament_id: inscriptionData.tournament_id,
            player_ci: inscriptionData.player_ci,
          },
        })
      } else if (inscriptionData.team_id) {
        duplicateInscription = await InscriptionDB.findOne({
          where: {
            tournament_id: inscriptionData.tournament_id,
            team_id: inscriptionData.team_id,
          },
        })
      }
      if (duplicateInscription) {
        return {
          status: 400,
          message: "Ya existe una inscripción para este jugador o equipo en el torneo.",
          data: null,
        }
      }

      const newInscription = await InscriptionDB.create(inscriptionData as any)

      const createdInscription = await InscriptionDB.findByPk(newInscription.getDataValue("inscription_id"), {
        include: [
          { model: PlayerDB },
          { model: TeamDB },
          { model: TournamentDB }
        ],
      })

      return {
        status: 201,
        message: "Inscripción creada correctamente",
        data: createdInscription,
      }
    } catch (error) {
      console.error("Error al crear inscripción:", error)
      return {
        status: 500,
        message: "Error al crear inscripción",
        data: null,
      }
    }
  }

  async update(inscription_id: number, inscription: InscriptionInterface) {
    try {
      const existingInscription = await InscriptionDB.findByPk(inscription_id)
      if (!existingInscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
          data: null,
        }
      }

      const { createdAt, updatedAt, ...inscriptionData } = inscription

      // Validación: solo uno de player_ci o team_id debe estar presente
      if (
        (!inscriptionData.player_ci && !inscriptionData.team_id) ||
        (inscriptionData.player_ci && inscriptionData.team_id)
      ) {
        return {
          status: 400,
          message: "Una inscripción debe ser para un jugador o para un equipo, pero no para ambos o ninguno.",
          data: null,
        }
      }

      // Si se está cambiando el jugador o el equipo, verificar duplicados
      let duplicateInscription = null
      if (inscriptionData.player_ci) {
        if (
          inscriptionData.player_ci !== existingInscription.getDataValue("player_ci") ||
          inscriptionData.tournament_id !== existingInscription.getDataValue("tournament_id")
        ) {
          duplicateInscription = await InscriptionDB.findOne({
            where: {
              tournament_id: inscriptionData.tournament_id,
              player_ci: inscriptionData.player_ci,
            },
          })
        }
      } else if (inscriptionData.team_id) {
        if (
          inscriptionData.team_id !== existingInscription.getDataValue("team_id") ||
          inscriptionData.tournament_id !== existingInscription.getDataValue("tournament_id")
        ) {
          duplicateInscription = await InscriptionDB.findOne({
            where: {
              tournament_id: inscriptionData.tournament_id,
              team_id: inscriptionData.team_id,
            },
          })
        }
      }
      if (duplicateInscription) {
        return {
          status: 400,
          message: "Ya existe una inscripción para este jugador o equipo en el torneo.",
          data: null,
        }
      }

      await InscriptionDB.update(inscriptionData, { where: { inscription_id } })

      const updatedInscription = await InscriptionDB.findByPk(inscription_id, {
        include: [
          { model: PlayerDB },
          { model: TeamDB },
          { model: TournamentDB }
        ],
      })

      return {
        status: 200,
        message: "Inscripción actualizada correctamente",
        data: updatedInscription,
      }
    } catch (error) {
      console.error("Error al actualizar inscripción:", error)
      return {
        status: 500,
        message: "Error al actualizar inscripción",
        data: null,
      }
    }
  }

  async delete(inscription_id: number) {
    try {
      const inscription = await InscriptionDB.findByPk(inscription_id)
      if (!inscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
        }
      }
      await InscriptionDB.destroy({ where: { inscription_id } })
      return {
        status: 200,
        message: "Inscripción eliminada correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar inscripción:", error)
      return {
        status: 500,
        message: "Error al eliminar inscripción",
      }
    }
  }
}

export const InscriptionServices = new InscriptionService()
