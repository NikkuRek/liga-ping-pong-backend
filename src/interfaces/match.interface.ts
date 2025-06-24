export interface MatchInterface {
  match_id?: number;
  tournament_id: number;
  inscription1_id: number;
  inscription2_id: number;
  winner_inscription_id?: number | null;
  match_datetime?: Date | null;
  round: string;
  status?: 'Pendiente' | 'En Juego' | 'Finalizado';
  createdAt?: Date;
  updatedAt?: Date;
}
