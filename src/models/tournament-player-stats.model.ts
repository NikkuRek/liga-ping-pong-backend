import { DataTypes } from "sequelize"

export const TournamentPlayerStatsModel = {
  id_inscription: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  games_played: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  wins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  points_for: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  points_against: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sets_for: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sets_against: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}
