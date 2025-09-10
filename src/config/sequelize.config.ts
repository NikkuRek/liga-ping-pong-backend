import { Sequelize, type Dialect } from "sequelize"
import dotenv from "dotenv"

import {
  AuraRecordModel,
  AvailabilityModel,
  CareerModel,
  DayModel,
  PlayerModel,
  TournamentModel,
  InscriptionModel,
  TeamModel,
  MatchModel,
  SetsModel,
  CredentialModel,
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

if (dbHost !== "localhost") {
  sequelizeOptions.port = dbPort
}

export const db = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions)

const noTimestampsOptions = {
  timestamps: false,
}

// Modelos
export const AuraRecordDB = db.define("aura_records", AuraRecordModel, {
  timestamps: true,
  tableName: "aura_records",
})

export const DayDB = db.define("days", DayModel, {
  timestamps: false,
  tableName: "days",
})

export const CareerDB = db.define("careers", CareerModel, {
  timestamps: true,
  tableName: "careers",
})

export const PlayerDB = db.define("players", PlayerModel, {
  timestamps: true,
  tableName: "players",
})

export const AvailabilityDB = db.define("availabilities", AvailabilityModel, {
  timestamps: true,
  tableName: "availabilities",
})

export const TeamDB = db.define("teams", TeamModel, {
  timestamps: true,
  tableName: "teams",
})

export const TournamentDB = db.define("tournaments", TournamentModel, {
  timestamps: true,
  tableName: "tournaments",
})

export const InscriptionDB = db.define("inscriptions", InscriptionModel, {
  timestamps: true,
  tableName: "inscriptions",
})

export const MatchDB = db.define("matches", MatchModel, {
  timestamps: true,
  tableName: "matches",
})

export const SetsDB = db.define("sets", SetsModel, {
  timestamps: true,
  tableName: "sets",
})

export const CredentialDB = db.define("credentials", CredentialModel, {
  timestamps: true,
  tableName: "credentials",
})



// Relaciones

PlayerDB.belongsToMany(DayDB, {
  through: AvailabilityDB,
  foreignKey: "player_ci",
  otherKey: "day_id",
  as: "Days",
})

DayDB.belongsToMany(PlayerDB, {
  through: AvailabilityDB,
  foreignKey: "day_id",
  otherKey: "player_ci",
  as: "Players",
})

PlayerDB.belongsTo(CareerDB, { foreignKey: "career_id" })
CareerDB.hasMany(PlayerDB, { foreignKey: "career_id" })

TeamDB.belongsTo(PlayerDB, { foreignKey: "player1_ci", as: "Player1" })
PlayerDB.hasMany(TeamDB, { foreignKey: "player1_ci", as: "TeamsAsPlayer1" })

TeamDB.belongsTo(PlayerDB, { foreignKey: "player2_ci", as: "Player2" })
PlayerDB.hasMany(TeamDB, { foreignKey: "player2_ci", as: "TeamsAsPlayer2" })

InscriptionDB.belongsTo(TournamentDB, { foreignKey: "tournament_id" })
TournamentDB.hasMany(InscriptionDB, { foreignKey: "tournament_id" })

InscriptionDB.belongsTo(PlayerDB, { foreignKey: "player_ci" })
PlayerDB.hasMany(InscriptionDB, { foreignKey: "player_ci" })

InscriptionDB.belongsTo(TeamDB, { foreignKey: "team_id" })
TeamDB.hasMany(InscriptionDB, { foreignKey: "team_id" })

MatchDB.belongsTo(TournamentDB, { foreignKey: "tournament_id" })
TournamentDB.hasMany(MatchDB, { foreignKey: "tournament_id" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "inscription1_id", as: "Inscription1" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "inscription1_id", as: "MatchesAsInscription1" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "inscription2_id", as: "Inscription2" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "inscription2_id", as: "MatchesAsInscription2" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "winner_inscription_id", as: "WinnerInscription" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "winner_inscription_id", as: "MatchesWon" })

SetsDB.belongsTo(MatchDB, { foreignKey: "match_id" })
MatchDB.hasMany(SetsDB, { foreignKey: "match_id" })

PlayerDB.hasOne(CredentialDB, { foreignKey: "player_ci", sourceKey: "ci" })
CredentialDB.belongsTo(PlayerDB, { foreignKey: "player_ci", targetKey: "ci" })

AuraRecordDB.belongsTo(PlayerDB, { foreignKey: "player_ci" })
PlayerDB.hasMany(AuraRecordDB, { foreignKey: "player_ci" })

AuraRecordDB.belongsTo(MatchDB, { foreignKey: "match_id" })
MatchDB.hasMany(AuraRecordDB, { foreignKey: "match_id" })

export const syncModels = async () => {
  try {
    await db.authenticate()
    console.log("Conectando a la base de datos...")
    await db.sync({ alter: true })
    console.log("Base de datos sincronizada")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    throw error
  }
}
syncModels()

export default db
