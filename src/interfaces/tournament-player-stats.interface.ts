export interface TournamentPlayerStatsInterface {
  id_inscription: number
  games_played: number
  wins: number
  losses: number
  points_for: number
  points_against: number
  sets_for: number
  sets_against: number
  createdAt?: Date
  updatedAt?: Date
}
