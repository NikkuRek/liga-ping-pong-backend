import "dotenv/config"

import {
  
  db,
} from "../config"

import {
 
} from "../data/seeders"

import { entidadSeed } from "./seeders"

export const insertSeeders = async () => {
  try {
    console.log("Iniciando inserción de datos de prueba...")
    await entidadSeed()
    console.log("Datos de prueba insertados correctamente")
  } catch (error) {
    console.error("Error al insertar datos de prueba:", error)
  }
}

const runSeeders = async () => {
  console.log("Ejecutando seeders...")

  // Ejecutar los seeders
  await insertSeeders()

  console.log("Seeders ejecutados correctamente")
}

const eject = async () => {
  try {
    await db
      .authenticate()
      .then(() => {
        console.log("Conexión exitosa a la base de datos")
      })
      .catch((error: any) => {
        console.log("No se pudo conectar a la base de datos")
        process.exit(1) // Salir si no hay conexión
      })

    await insertSeeders2()
  } catch (error) {
    console.error("Error durante la ejecución:", error)
    process.exit(1)
  }
}

async function insertSeeders2() {
  // Ordenamos los seeders por niveles de jerarquía
  const models = {
    level1: [],
    level2: [],
    level3: [],
    level4: [],
    level5: [],
    level6: [],
  }

  try {
    console.log("Insertando seeds de nivel 1...")
    
    console.log("Insertando seeds de nivel 2...")
   
    console.log("Insertando seeds de nivel 3...")
    
    console.log("Insertando seeds de nivel 4...")
   
    console.log("Insertando seeds de nivel 5...")
    
    console.log("Insertando seeds de nivel 6...")
    
    console.log("Se insertaron todos los seeds correctamente.")
  } catch (error) {
    console.error("Error al insertar seeds:", error)
  }
}

//eject()

runSeeders()
  .then(() => {
    console.log("Proceso de seeders completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error en el proceso de seeders:", error)
    process.exit(1)
  })

export default insertSeeders
