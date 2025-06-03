import { Sequelize, type Dialect, DataTypes } from "sequelize"
import dotenv from "dotenv"

import {
  AvailabilityModel,
  CareerModel,
  DayModel,
  PlayerModel,
  TierModel,
  TournamentModel,
  InscriptionModel,
  TeamModel,
  TeamInscriptionModel,
  MatchModel, 
  SetsModel,
  TournamentPlayerStatsModel,
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

export const AvailabilityDB = db.define("availability", AvailabilityModel, { timestamps: true })
export const CareerDB = db.define("career", CareerModel, { timestamps: true })
export const DayDB = db.define("day", DayModel, noTimestampsOptions)
export const PlayerDB = db.define("player", PlayerModel, { timestamps: true })
export const TierDB = db.define("tier", TierModel, noTimestampsOptions)
export const TournamentDB = db.define("tournament", TournamentModel, { timestamps: true })
export const InscriptionDB = db.define("inscription", InscriptionModel, { timestamps: true })
export const TeamDB = db.define("team", TeamModel, { timestamps: true })
export const TeamInscriptionDB = db.define("team_inscription", TeamInscriptionModel, { timestamps: true })

export const MatchDB = db.define("match", {
  ...MatchModel,
  id_team_inscription1: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TeamInscriptionDB,
      key: 'id',
    }
  },
  id_team_inscription2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TeamInscriptionDB,
      key: 'id',
    }
  },
  winner_team_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TeamInscriptionDB,
      key: 'id',
    }
  },
  loser_team_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TeamInscriptionDB,
      key: 'id',
    }
  },
  id_inscription_player1: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: InscriptionDB,
      key: 'id',
    }
  },
  id_inscription_player2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: InscriptionDB,
      key: 'id',
    }
  },
  winner_id_inscription: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: InscriptionDB,
      key: 'id',
    }
  },
  loser_id_inscription: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: InscriptionDB,
      key: 'id',
    }
  },
}, {
  timestamps: true,
  tableName: 'match'
})

export const SetsDB = db.define("sets", SetsModel, { timestamps: true })
export const TournamentPlayerStatsDB = db.define("tournament_player_stats", TournamentPlayerStatsModel, {
  timestamps: true,
})

PlayerDB.belongsToMany(DayDB, {
  through: AvailabilityDB,
  foreignKey: "CI",
  otherKey: "id_day",
  as: 'Days'
})

DayDB.belongsToMany(PlayerDB, {
  through: AvailabilityDB,
  foreignKey: "id_day",
  otherKey: "CI",
  as: 'Players'
})

PlayerDB.belongsTo(CareerDB, { foreignKey: "id_career" })
CareerDB.hasMany(PlayerDB, { foreignKey: "id_career" })

PlayerDB.belongsTo(TierDB, { foreignKey: "id_tier" })
TierDB.hasMany(PlayerDB, { foreignKey: "id_tier" })

InscriptionDB.belongsTo(PlayerDB, { foreignKey: "CI_player" })
PlayerDB.hasMany(InscriptionDB, { foreignKey: "CI_player" })

InscriptionDB.belongsTo(TournamentDB, { foreignKey: "id_tournament" })
TournamentDB.hasMany(InscriptionDB, { foreignKey: "id_tournament" })

TeamDB.belongsTo(PlayerDB, { foreignKey: "player1_CI", as: "Player1" })
PlayerDB.hasMany(TeamDB, { foreignKey: "player1_CI", as: "TeamsAsPlayer1" })

TeamDB.belongsTo(PlayerDB, { foreignKey: "player2_CI", as: "Player2" })
PlayerDB.hasMany(TeamDB, { foreignKey: "player2_CI", as: "TeamsAsPlayer2" })

TeamInscriptionDB.belongsTo(TeamDB, { foreignKey: "id_team" })
TeamDB.hasMany(TeamInscriptionDB, { foreignKey: "id_team" })

TeamInscriptionDB.belongsTo(TournamentDB, { foreignKey: "id_tournament" })
TournamentDB.hasMany(TeamInscriptionDB, { foreignKey: "id_tournament" })

MatchDB.belongsTo(TournamentDB, { foreignKey: "id_tournament" })
TournamentDB.hasMany(MatchDB, { foreignKey: "id_tournament" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "id_inscription_player1", as: "Player1Inscription" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "id_inscription_player1", as: "MatchesAsPlayer1" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "id_inscription_player2", as: "Player2Inscription" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "id_inscription_player2", as: "MatchesAsPlayer2" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "winner_id_inscription", as: "WinnerInscription" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "winner_id_inscription", as: "MatchesWonIndividual" })

MatchDB.belongsTo(InscriptionDB, { foreignKey: "loser_id_inscription", as: "LoserInscription" })
InscriptionDB.hasMany(MatchDB, { foreignKey: "loser_id_inscription", as: "MatchesLostIndividual" })

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "id_team_inscription1", as: "Team1Inscription" })
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "id_team_inscription1", as: "MatchesAsTeam1" })

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "id_team_inscription2", as: "Team2Inscription" })
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "id_team_inscription2", as: "MatchesAsTeam2" })

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "winner_team_inscription_id", as: "WinnerTeamInscription" })
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "winner_team_inscription_id", as: "MatchesWonTeam" })

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "loser_team_inscription_id", as: "LoserTeamInscription" })
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "loser_team_inscription_id", as: "MatchesLostTeam" })

MatchDB.belongsToMany(SetsDB, {
  through: 'match_sets',
  foreignKey: 'match_id',
  otherKey: 'sets_id_sets',
  as: 'Sets'
})

SetsDB.belongsToMany(MatchDB, {
  through: 'match_sets',
  foreignKey: 'sets_id_sets',
  otherKey: 'match_id',
  as: 'Matches'
})

TournamentPlayerStatsDB.belongsTo(InscriptionDB, { foreignKey: "id_inscription" })
InscriptionDB.hasOne(TournamentPlayerStatsDB, { foreignKey: "id_inscription", as: "Stats" })

export const syncModels = async () => {
  try {
    await db.authenticate()
    console.log("Conectando a la base de datos...")
    await db.sync({ alter: true })
    console.log("Base de datos sincronizada")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    throw error;
  }
}
syncModels()

export default db
