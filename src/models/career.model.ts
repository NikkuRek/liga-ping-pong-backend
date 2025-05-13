import { DataTypes } from "sequelize"

export const CareerModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name_career: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // Los campos createdAt y updatedAt serán manejados automáticamente por Sequelize
}
