import { Controller, Logger } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import {
  Payload,
  EventPattern,
  MessagePattern,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { Categoria } from './interfaces/categoria.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  logger = new Logger(CategoriasController.name);

  @EventPattern('criar-categoria')
  async criarCategoria(
    @Payload() categoria: Categoria,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`data: ${JSON.stringify(categoria)}`);

    try {
      await this.categoriasService.criarCategoria(categoria);
      channel.ack(originalMsg);
    } catch (error: unknown) {
      const err = error as Error;
      if (err) {
        this.logger.error(`error: ${JSON.stringify(err.message)}`);

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

  @MessagePattern('consultar-categorias')
  async consultarCategorias(
    @Payload() _id: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      if (_id) {
        return await this.categoriasService.consultarCategoriaPeloId(_id);
      } else {
        return await this.categoriasService.consultarTodasCategorias();
      }
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-categoria')
  async atualizarCategoria(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`data: ${JSON.stringify(data)}`);
    try {
      const _id: string = data.id;
      const categoria: Categoria = data.categoria;
      await this.categoriasService.atualizarCategoria(_id, categoria);
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
