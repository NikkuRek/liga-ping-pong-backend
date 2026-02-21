import { DataTypes } from "sequelize"

export const DayModel = {
  day_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  day_name: {
    type: DataTypes.ENUM("Lunes", "Martes", "Miércoles", "Jueves", "Viernes"),
    allowNull: false,
    unique: 'unique_day_name',
  },
}
