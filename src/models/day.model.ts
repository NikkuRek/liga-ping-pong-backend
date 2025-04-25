import { DataTypes } from "sequelize"

export const DayModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  day: {
    type: DataTypes.ENUM("Lunes", "Martes", "Miércoles", "Jueves", "Viernes"),
    allowNull: false,
  },
}

