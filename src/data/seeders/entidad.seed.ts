import { EntidadDB } from "../../config/sequelize.config"

export const entidadSeed = async () => {
  try {
    await EntidadDB.bulkCreate([
      {
        nombre: "Entidad de ejemplo 1",
        descripcion: "Esta es una entidad de ejemplo para el proyecto",
        activo: true,
      },
      {
        nombre: "Entidad de ejemplo 2",
        descripcion: "Esta es otra entidad de ejemplo para el proyecto",
        activo: true,
      },
    ])
    console.log("Seed de entidades ejecutado correctamente")
  } catch (error) {
    console.error("Error al ejecutar seed de entidades:", error)
  }
}

// Exportación nombrada para resolver el error
