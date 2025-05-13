import { TournamentDB } from "../../config/sequelize.config"

export const tournamentSeed = async () => {
    try {
        await TournamentDB.bulkCreate([
            {
                id: 1,
                name: "Liga 1-25 (Play-in)",
                description: "Liga que corresponde al primer período del 2025.",
                format: "Fase de Puntos",
                type: "Individual",
                start_date: "2025-05-06",
                end_date: "2023-05-31",
                status: "En proceso",
            },
            {
                id: 2,
                name: "Liga 1-25 (Play-off)",
                description: "Segunda fase de la liga 1-25.",
                format: "Eliminación directa",
                type: "Individual",
                start_date: "2025-06-01",
                end_date: "2025-06-13",
                status: "Próximo",
            },
        ])
        console.log("Seed de torneos ejecutado correctamente")
    } catch (error) {
        console.error("Error al ejecutar seed de torneos:", error)
    }
}