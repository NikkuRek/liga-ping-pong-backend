export interface MatchInterface {
  id?: number;
  id_tournament: number;
  match_date_time: Date;
  round: string;
  id_inscription1?: number | null;
  id_inscription2?: number | null;
  id_team_inscription1?: number | null; 
  id_team_inscription2?: number | null; 
  winner_inscription_id?: number | null;
  loser_inscription_id?: number | null;
  winner_team_inscription_id?: number | null;
  loser_team_inscription_id?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}
