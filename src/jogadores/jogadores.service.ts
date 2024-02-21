import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador } from './interfaces/jogador.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarJogador(jogador: Jogador): Promise<void> {
    try {
      const jogadorCriado = new this.jogadorModel(jogador);
      await jogadorCriado.save();
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

  async consultarTodosJogadores(): Promise<Jogador[]> {
    try {
      return await this.jogadorModel.find().lean().exec();
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

  async consultarJogadorPeloId(_id: string): Promise<Jogador> {
    try {
      return await this.jogadorModel.findOne({ _id }).lean().exec();
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

  async atualizarJogador(_id: string, jogador: Jogador): Promise<void> {
    try {
      await this.jogadorModel
        .findOneAndUpdate({ _id }, { $set: jogador })
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

  async deletarJogador(_id): Promise<void> {
    try {
      await this.jogadorModel.deleteOne({ _id }).exec();
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
