import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

import { archivoSchemas } from './schemas';
import packageJson from '../../package.json';

const DOMAIN = process.env.FRONTEND_URL;
const PORT = process.env.PORT;
const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX;

const apiVersion = packageJson.version.startsWith('v')
  ? packageJson.version.slice(1)
  : packageJson.version;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CAPIF | RestAPI',
      version: packageJson.version,
      description: `Documentación de rutas disponibles en la versión ${apiVersion}`,
      contact: {
        name: process.env.EMAIL_FROM,
        email: process.env.EMAIL_USER,
      },
    },
    components: {
      schemas: archivoSchemas,
    },
    servers: [
      {
        url: `${DOMAIN}:${PORT}/${GLOBAL_PREFIX}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {   
    app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocs, {
        customSiteTitle: 'CAPIF RestAPI',
        customCss: '.swagger-ui .topbar { display: none }',
        })
    );
};
