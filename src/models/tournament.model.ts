import { DataTypes } from "sequelize"

export const TournamentModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Próximo",
  },
}
