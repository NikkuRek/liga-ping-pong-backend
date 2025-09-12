import { CredentialDB } from "../../config/sequelize.config"
import bcrypt from "bcrypt"

export const credentialSeed = async () => {
  try {
    console.log("Iniciando seed de credenciales...")

    const credentialsToCreate = [
      {
        player_ci: "29944901",
        password: await bcrypt.hash("gabriel123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        player_ci: "29909792",
        password: await bcrypt.hash("pedro123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        player_ci: "30353315",
        password: await bcrypt.hash("luis123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        player_ci: "31366298",
        password: await bcrypt.hash("edgar123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        player_ci: "31350493",
        password: await bcrypt.hash("samuel123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const createdCredentials = await CredentialDB.bulkCreate(credentialsToCreate)
    console.log(`Seed de credenciales ejecutado correctamente. Insertados: ${createdCredentials.length}`)
  } catch (error) {
    console.error("Error al ejecutar seed de credenciales:", error)
    throw error
  }
}
