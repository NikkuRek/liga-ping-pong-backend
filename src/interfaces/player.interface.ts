import type { Model } from "sequelize"

export interface PlayerInterface {
  addDays(dayInstances: Model<any, any>[]): unknown
  CI: string
  first_name: string
  last_name: string
  phone: string
  semester: number
  id_career: number
  id_tier: number
  status: boolean
  createdAt?: Date
  updatedAt?: Date
}
