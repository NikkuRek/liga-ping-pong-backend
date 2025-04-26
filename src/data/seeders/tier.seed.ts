import { TierDB } from "../../config/sequelize.config"

export const tierSeed = async () => {
    try {
        await TierDB.bulkCreate([
            {
                id_tier: 1,
                range: "Principiante",
            },
            {
                id_tier: 2,
                range: "Intermedio",
            },
            {
                id_tier: 3,
                range: "Avanzado",
            },
        ])
        console.log("Seed de niveles ejecutado correctamente")
    } catch (error) {
        console.error("Error al ejecutar seed de niveles:", error)
    }
}