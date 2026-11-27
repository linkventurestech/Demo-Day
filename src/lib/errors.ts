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
      case 'invalid_email':
        return 'E-mail inválido.';
      case 'rate_limited':
        return 'Muitos códigos pedidos em pouco tempo. Espere alguns minutos e tente de novo.';
      case 'email_unavailable':
        return 'Não conseguimos enviar o e-mail agora. Tente de novo em instantes.';
      case 'invalid_code':
        return 'Código incorreto. Confira o e-mail e tente de novo.';
      case 'code_expired':
        return 'Esse código expirou ou já foi usado. Peça um novo.';
      case 'too_many_attempts':
        return 'Muitas tentativas erradas. Peça um novo código.';
      case 'slot_taken':
        return 'Essa posição já está ocupada por outra startup.';
      default:
        return e.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : e.message;
    }
  }
  return e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.';
}
