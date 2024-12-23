declare module 'sequelize-erd' {
  import { Sequelize } from 'sequelize';

  interface ErdOptions {
    source: Sequelize;
    format?: string; // Puedes definir otros formatos como 'svg', 'pdf', etc.
  }

  function sequelizeErd(options: ErdOptions): Promise<string>;

  export = sequelizeErd;
}