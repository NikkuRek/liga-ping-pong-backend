export interface InscriptionInterface {
  inscription_id?: number
  tournament_id: number
  player_ci?: string | null
  team_id?: number | null
  inscription_date: Date
  seed?: number | null
  createdAt?: Date
  updatedAt?: Date
}
