export interface TournamentInterface {
  tournament_id?: number
  name: string
  description?: string | null
  tournament_type: 'Individual' | 'Dobles'
  format: string
  start_date: Date
  end_date?: Date | null
  status: 'Próximo' | 'En Curso' | 'Finalizado' | 'Cancelado'
  createdAt?: Date
  updatedAt?: Date
}
