import { ApiError } from './api/types';

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'not_registered':
        return 'E-mail não encontrado na lista de inscritos. Use o e-mail da sua inscrição no Demo Day.';
      case 'invalid_session':
        return 'Sua sessão expirou. Entre novamente.';
      case 'voting_closed':
        return 'A votação está encerrada.';
      case 'not_admin':
        return 'Esta conta não tem acesso. O painel é liberado para quem é admin ou link_staff no portfolio da Link.';
      case 'stand_taken':
        return 'Esse stand já está com outra startup. Libere-o lá antes ou escolha outro.';
      case 'slot_taken':
        return 'Essa posição já está ocupada por outra startup.';
      default:
        return e.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : e.message;
    }
  }
  return e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.';
}
