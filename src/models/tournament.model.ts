import { DataTypes } from "sequelize"

export const TournamentModel = {
  tournament_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  tournament_type: {
    type: DataTypes.ENUM("Individual", "Dobles"),
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM("Próximo", "En Curso", "Finalizado", "Cancelado"),
    allowNull: false,
    defaultValue: "Próximo",
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
