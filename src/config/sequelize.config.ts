import { Sequelize, type Dialect } from "sequelize"
import dotenv from "dotenv"

import {
  AvailabilityModel,
  CareerModel,
  DayModel,
  PlayerModel,
  TierModel,
} from "../models"

dotenv.config()

const dbName: string = process.env.DATABASE_NAME!
const dbUser: string = process.env.DATABASE_USER!
const dbPassword: string = process.env.DATABASE_PASSWORD!
const dbDialect: Dialect = process.env.DATABASE_DIALECT! as Dialect
const dbHost: string = process.env.DATABASE_HOST!
const dbPort: number = Number(process.env.DATABASE_PORT)

const sequelizeOptions: any = {
  dialect: dbDialect,
  host: dbHost,
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

// Si el host no es localhost, agrega el puerto a las opciones
if (dbHost !== "localhost") {
  sequelizeOptions.port = dbPort
}

// Configuración de la conexión a la base de datos
export const db = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

const Options = {
  timestamps: false, // Deshabilitar createdAt y updatedAt
}

// CREAMOS LAS TABLAS EN ORDEN ALFABETICO
export const AvailabilityDB = db.define("availability", AvailabilityModel)
export const CareerDB = db.define("career", CareerModel)
export const DayDB = db.define("day", DayModel, Options)
export const PlayerDB = db.define("player", PlayerModel)
export const TierDB = db.define("tier", TierModel, Options)

// En las relaciones importa el orden de la jerarquia

// AvailabilityDB
DayDB.hasMany(AvailabilityDB, { foreignKey: "id_day" })
AvailabilityDB.belongsTo(DayDB, { foreignKey: "id_day" })
PlayerDB.hasMany(AvailabilityDB, { foreignKey: "CI" })
AvailabilityDB.belongsTo(PlayerDB, { foreignKey: "CI" })


// PlayerDB
CareerDB.hasMany(PlayerDB, { foreignKey: "id_career" });
PlayerDB.belongsTo(CareerDB, { foreignKey: "id_career" });
TierDB.hasMany(PlayerDB, { foreignKey: "id_tier" });
PlayerDB.belongsTo(TierDB, { foreignKey: "id_tier" });


// Relaciones muchos a muchos entre PlayerDB y DayDB a través de AvailabilityDB
// Esto permite que un jugador tenga disponibilidad en varios días y un día tenga varios jugadores disponibles

PlayerDB.belongsToMany(DayDB, {
  through: AvailabilityDB,   
  foreignKey: "CI",         
  otherKey: "id_day"
});

DayDB.belongsToMany(PlayerDB, {
  through: AvailabilityDB,   
  foreignKey: "id_day",
  otherKey: "CI"            
});



// Sincroniza los modelos con la base de datos
const syncModels = async () => {
  try {
    await db.authenticate()
    console.log("Conectando a la base de datos...")
    await db.sync({ alter: true })
    console.log("Base de datos sincronizada")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
  }
}

syncModels()

export default db
