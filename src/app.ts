import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes';
import sequelize from './database/config';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api', router);

sequelize
  .authenticate()
  // eslint-disable-next-line no-console
  .then(() => console.log('Conectado a la base de datos'))
  // eslint-disable-next-line no-console
  .catch((err) => console.log('Error de conexión a la base de datos:', err));

export default app;
