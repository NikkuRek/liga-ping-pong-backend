import { CareerDB } from "../../config/sequelize.config"

export const careerSeed = async () => {
    try {
        await CareerDB.bulkCreate([
            {
                id: 1,
                name_career: "Informática",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                name_career: "Administración de Empresas",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                name_career: "Mecánica",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 4,
                name_career: "Electrónica",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 5,
                name_career: "Electrotecnia",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 6,
                name_career: "Contaduría",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 7,
                name_career: "Educación",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ])
        console.log("Seed de carreras ejecutado correctamente")
    } catch (error) {
        console.error("Error al ejecutar seed de carreras:", error)
    }
}