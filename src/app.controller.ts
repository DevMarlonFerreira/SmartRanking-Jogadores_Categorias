import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Categoria } from './interfaces/categorias/categoria.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  logger = new Logger(AppController.name);

  @EventPattern('criar-categoria')
  async criarCategoria(
    @Payload() categoria: Categoria,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`categoria: ${JSON.stringify(categoria)}`);
    try {
      await this.appService.criarCategoria(categoria);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.filter((ackError) => {
        error.message.includes(ackError);
      });

      if (filterAckError) {
        channel.ack(originalMsg);
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
        return await this.appService.consultaCategoriaPeloId(_id);
      } else {
        return await this.appService.consultarTodasCategorias();
      }
    } finally {
      channel.ack(originalMsg);
    }
  }
}
