import { TeamDB } from "../../config/sequelize.config"

export const teamSeed = async () => {
  try {
    console.log("Iniciando seed de equipos...")

    // Equipos de ejemplo, usando CIs de jugadores existentes
    const teamsToCreate = [
      {
        player1_ci: "29944901",
        player2_ci: "29909792",
        team_name: "Titans",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        player1_ci: "30353315",
        player2_ci: "31366298",
        team_name: "Ping Masters",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        player1_ci: "31350493",
        player2_ci: "29944901",
        team_name: "The Avengers",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const createdTeams = await TeamDB.bulkCreate(teamsToCreate)
    console.log(`Seed de equipos ejecutado correctamente. Insertados: ${createdTeams.length}`)
  } catch (error) {
    console.error("Error al ejecutar seed de equipos:", error)
    throw error
  }
}
