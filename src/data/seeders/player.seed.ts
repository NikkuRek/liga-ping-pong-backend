import { PlayerDB } from "../../config/sequelize.config"

export const playerSeed = async () => {
    try {
        await PlayerDB.bulkCreate([
            {
                CI: "29944901",
                first_name: "Gabriel",
                last_name: "Piña",
                phone: "04122886568",
                semester: 5,
                id_career: 1,
                id_tier: 3,
                status: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                CI: "29909792",
                first_name: "Pedro",
                last_name: "Riera",
                phone: "04145121252 ",
                semester: 4,
                id_career: 1,
                id_tier: 3,
                status: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                CI: "30353315",
                first_name: "Luis",
                last_name: "Cala",
                phone: "04245170604",
                semester: 2,
                id_career: 1,
                id_tier: 2,
                status: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                CI: "31366298",
                first_name: "Edgar",
                last_name: "Briceño",
                phone: "04262498651",
                semester: 3,
                id_career: 1,
                id_tier: 2,
                status: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ])
        console.log("Seed de jugadores ejecutado correctamente")
    } catch (error) {
        console.error("Error al ejecutar seed de jugadores", error)
    }
}