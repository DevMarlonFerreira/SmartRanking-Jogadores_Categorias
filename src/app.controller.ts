import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { Categoria } from './interfaces/categorias/categoria.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  logger = new Logger(AppController.name);

  @EventPattern('criar-categoria')
  async criarCategoria(@Payload() categoria: Categoria) {
    this.logger.log(`categoria: ${JSON.stringify(categoria)}`);

    this.appService.criarCategoria(categoria);
  }

  @MessagePattern('consultar-categorias')
  async consultarCategorias(@Payload() _id: string) {
    if (_id) {
      return await this.appService.consultaCategoriaPeloId(_id);
    } else {
      return await this.appService.consultarTodasCategorias();
    }
  }
}
