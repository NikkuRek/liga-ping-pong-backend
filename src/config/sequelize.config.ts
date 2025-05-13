import { Sequelize, type Dialect, DataTypes } from "sequelize" // Importar DataTypes
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
} from "../models" // Ajusta la ruta si es necesario

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
  logging: false, // Puedes cambiar a true para ver las queries SQL en consola
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
export const db = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions)

// Opciones para tablas sin timestamps
const noTimestampsOptions = {
  timestamps: false,
}

// CREAMOS LAS TABLAS (El orden de definición aquí no importa para FKs, solo para db.define)
export const AvailabilityDB = db.define("availability", AvailabilityModel, { timestamps: true })
export const CareerDB = db.define("career", CareerModel, { timestamps: true })
export const DayDB = db.define("day", DayModel, noTimestampsOptions)
export const PlayerDB = db.define("player", PlayerModel, { timestamps: true })
export const TierDB = db.define("tier", TierModel, noTimestampsOptions)

// Nuevas tablas
export const TournamentDB = db.define("tournament", TournamentModel, { timestamps: true })
export const InscriptionDB = db.define("inscription", InscriptionModel, { timestamps: true })
export const TeamDB = db.define("team", TeamModel, { timestamps: true })
export const TeamInscriptionDB = db.define("team_inscription", TeamInscriptionModel, { timestamps: true })

// *** MODIFICACIÓN CLAVE: Definir MatchDB para incluir FKs de Individuales Y Dobles ***
// Asegúrate de que tu MatchModel en ../models/index.ts (o donde esté)
// tenga definidas estas columnas:
// id_tournament, match_date_time, round,
// id_inscription_player1, id_inscription_player2, winner_id_inscription, loser_id_inscription,
// id_team_inscription1, id_team_inscription2, winner_team_inscription_id, loser_team_inscription_id
export const MatchDB = db.define("match", {
  ...MatchModel, // Incluir las definiciones de columnas existentes de tu modelo
  // Añadir explícitamente las columnas para FKs de dobles si no están en MatchModel
  // (O asegurarte de que MatchModel ya las tiene)
  id_team_inscription1: {
    type: DataTypes.INTEGER, // O el tipo de tu PK en team_inscription
    allowNull: true, // Permitir NULL porque puede ser un partido individual
    references: {
      model: TeamInscriptionDB, // Referencia al modelo TeamInscriptionDB
      key: 'id', // La clave primaria en TeamInscriptionDB
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
    allowNull: true, // Puede ser NULL si el partido no ha terminado
    references: {
      model: TeamInscriptionDB,
      key: 'id',
    }
  },
  loser_team_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser NULL si el partido no ha terminado
    references: {
      model: TeamInscriptionDB,
      key: 'id',
    }
  },
  // Asegurarte de que las FKs individuales también estén definidas en MatchModel
  // (Si ya están en tu MatchModel importado, no necesitas redefinirlas aquí)
  id_inscription_player1: {
    type: DataTypes.INTEGER, // O el tipo de tu PK en inscription
    allowNull: true, // Permitir NULL porque puede ser un partido de dobles
    references: {
      model: InscriptionDB, // Referencia al modelo InscriptionDB
      key: 'id', // La clave primaria en InscriptionDB
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
    allowNull: true, // Puede ser NULL si el partido no ha terminado
    references: {
      model: InscriptionDB,
      key: 'id',
    }
  },
  loser_id_inscription: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser NULL si el partido no ha terminado
    references: {
      model: InscriptionDB,
      key: 'id',
    }
  },
  // Sequelize añade createdAt y updatedAt por defecto si timestamps: true
}, {
  timestamps: true, // Asegúrate de que los timestamps estén habilitados si los usas
  tableName: 'match' // Asegúrate de que el nombre de la tabla sea 'match'
})


export const SetsDB = db.define("sets", SetsModel, { timestamps: true })
export const TournamentPlayerStatsDB = db.define("tournament_player_stats", TournamentPlayerStatsModel, {
  timestamps: true,
})

// DEFINICIÓN DE RELACIONES (Asociaciones Sequelize)

// RELACIONES EXISTENTES (Mantienen la estructura de FKs)
// AvailabilityDB (Tabla intermedia para Many-to-Many entre Player y Day)
// Las FKs ya están definidas en el modelo AvailabilityModel, aquí definimos las asociaciones Sequelize
PlayerDB.belongsToMany(DayDB, {
  through: AvailabilityDB,
  foreignKey: "CI", // FK en AvailabilityDB que apunta a PlayerDB
  otherKey: "id_day", // FK en AvailabilityDB que apunta a DayDB
  as: 'Days' // Alias para acceder a los días desde un jugador (ej: player.getDays())
})

DayDB.belongsToMany(PlayerDB, {
  through: AvailabilityDB,
  foreignKey: "id_day", // FK en AvailabilityDB que apunta a DayDB
  otherKey: "CI", // FK en AvailabilityDB que apunta a PlayerDB
  as: 'Players' // Alias para acceder a los jugadores desde un día (ej: day.getPlayers())
})

// PlayerDB (Relaciones con Career y Tier)
PlayerDB.belongsTo(CareerDB, { foreignKey: "id_career" })
CareerDB.hasMany(PlayerDB, { foreignKey: "id_career" }) // Relación inversa

PlayerDB.belongsTo(TierDB, { foreignKey: "id_tier" })
TierDB.hasMany(PlayerDB, { foreignKey: "id_tier" }) // Relación inversa


// NUEVAS RELACIONES

// Inscription (Relaciones con Player y Tournament)
InscriptionDB.belongsTo(PlayerDB, { foreignKey: "CI_player" }); // FK en InscriptionDB que apunta a PlayerDB (CI_player)
PlayerDB.hasMany(InscriptionDB, { foreignKey: "CI_player" }); // Relación inversa

InscriptionDB.belongsTo(TournamentDB, { foreignKey: "id_tournament" }); // FK en InscriptionDB que apunta a TournamentDB
TournamentDB.hasMany(InscriptionDB, { foreignKey: "id_tournament" }); // Relación inversa


// Team (Relaciones con Player - para jugador 1 y jugador 2)
TeamDB.belongsTo(PlayerDB, { foreignKey: "player1_CI", as: "Player1" }); // FK en TeamDB que apunta a PlayerDB (player1_CI)
PlayerDB.hasMany(TeamDB, { foreignKey: "player1_CI", as: "TeamsAsPlayer1" }); // Relación inversa

TeamDB.belongsTo(PlayerDB, { foreignKey: "player2_CI", as: "Player2" }); // FK en TeamDB que apunta a PlayerDB (player2_CI)
PlayerDB.hasMany(TeamDB, { foreignKey: "player2_CI", as: "TeamsAsPlayer2" }); // Relación inversa


// TeamInscription (Relaciones con Team y Tournament)
TeamInscriptionDB.belongsTo(TeamDB, { foreignKey: "id_team" }); // FK en TeamInscriptionDB que apunta a TeamDB
TeamDB.hasMany(TeamInscriptionDB, { foreignKey: "id_team" }); // Relación inversa

TeamInscriptionDB.belongsTo(TournamentDB, { foreignKey: "id_tournament" }); // FK en TeamInscriptionDB que apunta a TournamentDB
TournamentDB.hasMany(TeamInscriptionDB, { foreignKey: "id_tournament" }); // Relación inversa


// *** MODIFICACIÓN CLAVE: Definición de Relaciones para MatchDB (Individuales Y Dobles) ***

// Relación de Match con Tournament
MatchDB.belongsTo(TournamentDB, { foreignKey: "id_tournament" });
TournamentDB.hasMany(MatchDB, { foreignKey: "id_tournament" }); // Relación inversa

// Relaciones de Match con Inscription (para partidos INDIVIDUALES)
// Usamos 'allowNull: true' en las FKs en la definición del modelo MatchDB
MatchDB.belongsTo(InscriptionDB, { foreignKey: "id_inscription_player1", as: "Player1Inscription" });
InscriptionDB.hasMany(MatchDB, { foreignKey: "id_inscription_player1", as: "MatchesAsPlayer1" });

MatchDB.belongsTo(InscriptionDB, { foreignKey: "id_inscription_player2", as: "Player2Inscription" });
InscriptionDB.hasMany(MatchDB, { foreignKey: "id_inscription_player2", as: "MatchesAsPlayer2" });

MatchDB.belongsTo(InscriptionDB, { foreignKey: "winner_id_inscription", as: "WinnerInscription" });
InscriptionDB.hasMany(MatchDB, { foreignKey: "winner_id_inscription", as: "MatchesWonIndividual" });

MatchDB.belongsTo(InscriptionDB, { foreignKey: "loser_id_inscription", as: "LoserInscription" });
InscriptionDB.hasMany(MatchDB, { foreignKey: "loser_id_inscription", as: "MatchesLostIndividual" });


// Relaciones de Match con TeamInscription (para partidos de DOBLES)
// Usamos 'allowNull: true' en las FKs en la definición del modelo MatchDB
MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "id_team_inscription1", as: "Team1Inscription" });
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "id_team_inscription1", as: "MatchesAsTeam1" });

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "id_team_inscription2", as: "Team2Inscription" });
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "id_team_inscription2", as: "MatchesAsTeam2" });

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "winner_team_inscription_id", as: "WinnerTeamInscription" });
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "winner_team_inscription_id", as: "MatchesWonTeam" });

MatchDB.belongsTo(TeamInscriptionDB, { foreignKey: "loser_team_inscription_id", as: "LoserTeamInscription" });
TeamInscriptionDB.hasMany(MatchDB, { foreignKey: "loser_team_inscription_id", as: "MatchesLostTeam" });


// Sets (Relación con Match) - Asumiendo tabla de unión match_sets
// Si tienes una tabla de unión 'match_sets' con FKs a 'match' y 'sets'
MatchDB.belongsToMany(SetsDB, {
  through: 'match_sets', // Nombre de la tabla de unión
  foreignKey: 'match_id', // FK en 'match_sets' que apunta a 'match'
  otherKey: 'sets_id_sets', // FK en 'match_sets' que apunta a 'sets'
  as: 'Sets' // Alias para acceder a los sets desde un partido
});

SetsDB.belongsToMany(MatchDB, {
  through: 'match_sets',
  foreignKey: 'sets_id_sets',
  otherKey: 'match_id',
  as: 'Matches' // Alias para acceder a los partidos desde un set (quizás menos común)
});


// TournamentPlayerStats (Relación con Inscription)
TournamentPlayerStatsDB.belongsTo(InscriptionDB, { foreignKey: "id_inscription" }); // FK en TournamentPlayerStatsDB que apunta a InscriptionDB
InscriptionDB.hasOne(TournamentPlayerStatsDB, { foreignKey: "id_inscription", as: "Stats" }); // Relación inversa (útil para inscription.getStats())


// Sincroniza los modelos con la base de datos
export const syncModels = async () => { // Asegúrate de que esta función esté exportada
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
