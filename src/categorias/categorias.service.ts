import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
  ) {}

  private readonly logger = new Logger(CategoriasService.name);

  async criarCategoria(categoria: Categoria): Promise<void> {
    try {
      const categoriaCriada = new this.categoriaModel(categoria);
      await categoriaCriada.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarTodasCategorias(): Promise<Categoria[]> {
    try {
      return await this.categoriaModel.find().lean().exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarCategoriaPeloId(_id: string): Promise<Categoria> {
    try {
      return await this.categoriaModel.findOne({ _id }).lean().exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async atualizarCategoria(_id: string, categoria: Categoria): Promise<void> {
    try {
      await this.categoriaModel
        .findOneAndUpdate({ _id }, { $set: categoria })
        .exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }
}
