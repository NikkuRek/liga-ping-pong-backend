import { DataTypes } from "sequelize";

export const MatchModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_tournament: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  match_date_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  round: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_team_inscription1: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_team_inscription2: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_inscription1: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_inscription2: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  winner_team_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  loser_team_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  winner_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  loser_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}