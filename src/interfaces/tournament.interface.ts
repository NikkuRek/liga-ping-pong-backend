export interface TournamentInterface {
  id?: number
  name: string
  description?: string
  format: string
  type: string
  start_date: Date
  end_date?: Date
  status: string
  createdAt?: Date
  updatedAt?: Date
}
