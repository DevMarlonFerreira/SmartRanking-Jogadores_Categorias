import { Controller, Logger } from '@nestjs/common';
import { JogadoresService } from './jogadores.service';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { Jogador } from './interfaces/jogador.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class JogadoresController {
  logger = new Logger(JogadoresController.name);
  constructor(private readonly jogadoresService: JogadoresService) {}

  @EventPattern('criar-jogador')
  async criarJogador(@Payload() jogador: Jogador, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`jogador: ${JSON.stringify(jogador)}`);
      await this.jogadoresService.criarJogador(jogador);
      channel.ack(originalMsg);
    } catch (error: unknown) {
      const err = error as Error;
      if (err) {
        this.logger.log(`error: ${JSON.stringify(err.message)}`);
        const filterAckError = ackErrors.filter((ackError) =>
          err.message.includes(ackError),
        );

        if (filterAckError.length > 0) {
          channel.ack(originalMsg);
        }
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
      }
    }
  }

  @MessagePattern('consultar-jogadores')
  async consultarJogadores(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      if (_id) {
        return await this.jogadoresService.consultarJogadorPeloId(_id);
      } else {
        return await this.jogadoresService.consultarTodosJogadores();
      }
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-jogador')
  async atualizarJogador(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const _id: string = data.id;
      const jogador: Jogador = data.jogador;
      await this.jogadoresService.atualizarJogador(_id, jogador);
      channel.ack(originalMsg);
    } catch (error: unknown) {
      const err = error as Error;
      if (err) {
        const filterAckError = ackErrors.filter((ackError) =>
          err.message.includes(ackError),
        );
        if (filterAckError.length > 0) {
          channel.ack(originalMsg);
        }
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
      }
    }
  }

  @EventPattern('deletar-jogador')
  async deletarJogador(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.jogadoresService.deletarJogador(_id);
      channel.ack(originalMsg);
    } catch (error: unknown) {
      const err = error as Error;
      if (err) {
        const filterAckError = ackErrors.filter((ackError) =>
          err.message.includes(ackError),
        );
        if (filterAckError.length > 0) {
          channel.ack(originalMsg);
        }
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
      }
    }
  }
}
