import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador } from './interfaces/jogadores/jogador.interface';
import { Categoria } from './interfaces/categorias/categoria.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(AppService.name);

  async criarCategoria(categoria: Categoria): Promise<Categoria> {
    try {
      const categoriaCriada = new this.categoriaModel(categoria);
      return await categoriaCriada.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarTodasCategorias(): Promise<Categoria[]> {
    try {
      return await this.categoriaModel.find().lean().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultaCategoriaPeloId(_id: string): Promise<Categoria> {
    try {
      return await this.categoriaModel.findOne({ _id }).lean().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async atualizarCategoria(_id: string, categoria: Categoria): Promise<void> {
    try {
      await this.categoriaModel.findOneAndUpdate({ _id },{$set: categoria}).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
