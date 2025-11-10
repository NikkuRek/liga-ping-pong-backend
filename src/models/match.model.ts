import { DataTypes } from "sequelize";

export const MatchModel = {
  match_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inscription1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inscription2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winner_inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  match_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  round: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'En Juego', 'Finalizado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente',
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
};
