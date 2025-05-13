import {
  TournamentPlayerStatsDB,
  InscriptionDB,
  PlayerDB,
  TournamentDB,
  MatchDB,
  SetsDB,
  TeamInscriptionDB,
  TeamDB,
} from "../config/sequelize.config"
import type { TournamentPlayerStatsInterface } from "../interfaces"

class TournamentPlayerStatsService {
  async getAll() {
    try {
      const stats = await TournamentPlayerStatsDB.findAll({
        include: [
          {
            model: InscriptionDB,
            include: [{ model: PlayerDB }, { model: TournamentDB }],
          },
        ],
      })
      return {
        status: 200,
        message: "Estadísticas obtenidas correctamente",
        data: stats,
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      return {
        status: 500,
        message: "Error al obtener estadísticas",
        data: null,
      }
    }
  }

  async getByInscriptionId(id: number) {
    try {
      const stats = await TournamentPlayerStatsDB.findByPk(id, {
        include: [
          {
            model: InscriptionDB,
            include: [{ model: PlayerDB }, { model: TournamentDB }],
          },
        ],
      })
      if (!stats) {
        return {
          status: 404,
          message: "Estadísticas no encontradas",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Estadísticas obtenidas correctamente",
        data: stats,
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      return {
        status: 500,
        message: "Error al obtener estadísticas",
        data: null,
      }
    }
  }

  async getByTournament(tournamentId: number) {
    try {
      const stats = await TournamentPlayerStatsDB.findAll({
        include: [
          {
            model: InscriptionDB,
            where: { id_tournament: tournamentId },
            include: [{ model: PlayerDB }, { model: TournamentDB }],
          },
        ],
      })
      return {
        status: 200,
        message: "Estadísticas del torneo obtenidas correctamente",
        data: stats,
      }
    } catch (error) {
      console.error("Error al obtener estadísticas del torneo:", error)
      return {
        status: 500,
        message: "Error al obtener estadísticas del torneo",
        data: null,
      }
    }
  }

  async getByPlayer(CI: string) {
    try {
      const stats = await TournamentPlayerStatsDB.findAll({
        include: [
          {
            model: InscriptionDB,
            where: { CI: CI },
            include: [{ model: PlayerDB }, { model: TournamentDB }],
          },
        ],
      })
      return {
        status: 200,
        message: "Estadísticas del jugador obtenidas correctamente",
        data: stats,
      }
    } catch (error) {
      console.error("Error al obtener estadísticas del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener estadísticas del jugador",
        data: null,
      }
    }
  }

  async create(stats: TournamentPlayerStatsInterface) {
    try {
      // Verificar si la inscripción existe
      const inscription = await InscriptionDB.findByPk(stats.id_inscription)
      if (!inscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
          data: null,
        }
      }

      // Verificar si ya existen estadísticas para esta inscripción
      const existingStats = await TournamentPlayerStatsDB.findByPk(stats.id_inscription)
      if (existingStats) {
        return {
          status: 400,
          message: "Ya existen estadísticas para esta inscripción",
          data: null,
        }
      }

      const { createdAt, updatedAt, ...statsData } = stats
      const newStats = await TournamentPlayerStatsDB.create(statsData as any)

      return {
        status: 201,
        message: "Estadísticas creadas correctamente",
        data: newStats,
      }
    } catch (error) {
      console.error("Error al crear estadísticas:", error)
      return {
        status: 500,
        message: "Error al crear estadísticas",
        data: null,
      }
    }
  }

  async update(id: number, stats: TournamentPlayerStatsInterface) {
    try {
      const existingStats = await TournamentPlayerStatsDB.findByPk(id)
      if (!existingStats) {
        return {
          status: 404,
          message: "Estadísticas no encontradas",
          data: null,
        }
      }

      const { createdAt, updatedAt, id_inscription, ...statsData } = stats
      await TournamentPlayerStatsDB.update(statsData, { where: { id_inscription: id } })

      const updatedStats = await TournamentPlayerStatsDB.findByPk(id, {
        include: [
          {
            model: InscriptionDB,
            include: [{ model: PlayerDB }, { model: TournamentDB }],
          },
        ],
      })

      return {
        status: 200,
        message: "Estadísticas actualizadas correctamente",
        data: updatedStats,
      }
    } catch (error) {
      console.error("Error al actualizar estadísticas:", error)
      return {
        status: 500,
        message: "Error al actualizar estadísticas",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const stats = await TournamentPlayerStatsDB.findByPk(id)
      if (!stats) {
        return {
          status: 404,
          message: "Estadísticas no encontradas",
        }
      }
      await TournamentPlayerStatsDB.destroy({ where: { id_inscription: id } })
      return {
        status: 200,
        message: "Estadísticas eliminadas correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar estadísticas:", error)
      return {
        status: 500,
        message: "Error al eliminar estadísticas",
      }
    }
  }

  async updateFromMatch(matchId: number) {
    try {
      const match = await MatchDB.findByPk(matchId, {
        include: [
          {
            model: TeamInscriptionDB,
            as: "Team1",
            include: [{ model: TeamDB }],
          },
          {
            model: TeamInscriptionDB,
            as: "Team2",
            include: [{ model: TeamDB }],
          },
          { model: SetsDB },
        ],
      })

      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        }
      }

      if (!match.getDataValue("winner_team_inscription_id") || !match.getDataValue("loser_team_inscription_id")) {
        return {
          status: 400,
          message: "El partido no tiene ganador y perdedor definidos",
        }
      }

      const sets = match.getDataValue("sets")
      if (!sets || sets.length === 0) {
        return {
          status: 400,
          message: "El partido no tiene sets registrados",
        }
      }

      // Actualizar estadísticas para los jugadores del equipo ganador
      const winnerTeam =
        match.getDataValue("winner_team_inscription_id") === match.getDataValue("id_team_inscription1")
          ? match.getDataValue("Team1")
          : match.getDataValue("Team2")

      const loserTeam =
        match.getDataValue("loser_team_inscription_id") === match.getDataValue("id_team_inscription1")
          ? match.getDataValue("Team1")
          : match.getDataValue("Team2")

      // Calcular puntos y sets
      let winnerPoints = 0
      let loserPoints = 0
      let winnerSets = 0
      let loserSets = 0

      for (const set of sets) {
        const isTeam1Winner = set.getDataValue("score1") > set.getDataValue("score2")

        if (winnerTeam.getDataValue("id") === match.getDataValue("id_team_inscription1")) {
          winnerPoints += set.getDataValue("score1")
          loserPoints += set.getDataValue("score2")
          if (isTeam1Winner) winnerSets++
          else loserSets++
        } else {
          winnerPoints += set.getDataValue("score2")
          loserPoints += set.getDataValue("score1")
          if (!isTeam1Winner) winnerSets++
          else loserSets++
        }
      }

      // Actualizar estadísticas para los jugadores del equipo ganador
      const team = winnerTeam.getDataValue("team")
      const player1CI = team.getDataValue("player1_CI")
      const player2CI = team.getDataValue("player2_CI")

      // Buscar inscripciones de los jugadores
      const player1Inscription = await InscriptionDB.findOne({
        where: {
          CI: player1CI,
          id_tournament: match.getDataValue("id_tournament"),
        },
      })

      const player2Inscription = await InscriptionDB.findOne({
        where: {
          CI: player2CI,
          id_tournament: match.getDataValue("id_tournament"),
        },
      })

      if (player1Inscription) {
        const player1Stats = await TournamentPlayerStatsDB.findByPk(player1Inscription.getDataValue("id"))
        if (player1Stats) {
          await player1Stats.update({
            games_played: player1Stats.getDataValue("games_played") + 1,
            wins: player1Stats.getDataValue("wins") + 1,
            points_for: player1Stats.getDataValue("points_for") + winnerPoints,
            points_against: player1Stats.getDataValue("points_against") + loserPoints,
            sets_for: player1Stats.getDataValue("sets_for") + winnerSets,
            sets_against: player1Stats.getDataValue("sets_against") + loserSets,
          })
        }
      }

      if (player2Inscription) {
        const player2Stats = await TournamentPlayerStatsDB.findByPk(player2Inscription.getDataValue("id"))
        if (player2Stats) {
          await player2Stats.update({
            games_played: player2Stats.getDataValue("games_played") + 1,
            wins: player2Stats.getDataValue("wins") + 1,
            points_for: player2Stats.getDataValue("points_for") + winnerPoints,
            points_against: player2Stats.getDataValue("points_against") + loserPoints,
            sets_for: player2Stats.getDataValue("sets_for") + winnerSets,
            sets_against: player2Stats.getDataValue("sets_against") + loserSets,
          })
        }
      }

      // Actualizar estadísticas para los jugadores del equipo perdedor
      const loserTeamObj = loserTeam.getDataValue("team")
      const loserPlayer1CI = loserTeamObj.getDataValue("player1_CI")
      const loserPlayer2CI = loserTeamObj.getDataValue("player2_CI")

      const loserPlayer1Inscription = await InscriptionDB.findOne({
        where: {
          CI: loserPlayer1CI,
          id_tournament: match.getDataValue("id_tournament"),
        },
      })

      const loserPlayer2Inscription = await InscriptionDB.findOne({
        where: {
          CI: loserPlayer2CI,
          id_tournament: match.getDataValue("id_tournament"),
        },
      })

      if (loserPlayer1Inscription) {
        const loserPlayer1Stats = await TournamentPlayerStatsDB.findByPk(loserPlayer1Inscription.getDataValue("id"))
        if (loserPlayer1Stats) {
          await loserPlayer1Stats.update({
            games_played: loserPlayer1Stats.getDataValue("games_played") + 1,
            losses: loserPlayer1Stats.getDataValue("losses") + 1,
            points_for: loserPlayer1Stats.getDataValue("points_for") + loserPoints,
            points_against: loserPlayer1Stats.getDataValue("points_against") + winnerPoints,
            sets_for: loserPlayer1Stats.getDataValue("sets_for") + loserSets,
            sets_against: loserPlayer1Stats.getDataValue("sets_against") + winnerSets,
          })
        }
      }

      if (loserPlayer2Inscription) {
        const loserPlayer2Stats = await TournamentPlayerStatsDB.findByPk(loserPlayer2Inscription.getDataValue("id"))
        if (loserPlayer2Stats) {
          await loserPlayer2Stats.update({
            games_played: loserPlayer2Stats.getDataValue("games_played") + 1,
            losses: loserPlayer2Stats.getDataValue("losses") + 1,
            points_for: loserPlayer2Stats.getDataValue("points_for") + loserPoints,
            points_against: loserPlayer2Stats.getDataValue("points_against") + winnerPoints,
            sets_for: loserPlayer2Stats.getDataValue("sets_for") + loserSets,
            sets_against: loserPlayer2Stats.getDataValue("sets_against") + winnerSets,
          })
        }
      }

      return {
        status: 200,
        message: "Estadísticas actualizadas correctamente desde el partido",
      }
    } catch (error) {
      console.error("Error al actualizar estadísticas desde el partido:", error)
      return {
        status: 500,
        message: "Error al actualizar estadísticas desde el partido",
      }
    }
  }
}

export const TournamentPlayerStatsServices = new TournamentPlayerStatsService()
