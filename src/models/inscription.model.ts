import { DataTypes } from "sequelize"

export const InscriptionModel = {
  inscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "tournaments",
      key: "tournament_id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  player_ci: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
    references: {
      model: "players",
      key: "ci",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    references: {
      model: "teams",
      key: "team_id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  inscription_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  seed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}

// Para los índices únicos compuestos, agrégalos en la definición del modelo Sequelize:
export const InscriptionIndexes = [
  {
    unique: true,
    fields: ["tournament_id", "player_ci"],
    name: "unique_inscription_player"
  },
  {
    unique: true,
    fields: ["tournament_id", "team_id"],
    name: "unique_inscription_team"
  }
]
