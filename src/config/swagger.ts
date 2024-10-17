import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

import {
  archivoSchemas,
  authSchemas,
  conflictoSchemas,
  consultaSchemas,
  cuentaCorrienteSchemas,
  dbSchemas,
  userSchemas,
} from './schemas';
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
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ...archivoSchemas,
        ...authSchemas,
        ...conflictoSchemas,
        ...consultaSchemas,
        ...cuentaCorrienteSchemas,
        ...dbSchemas,
        ...userSchemas,
      },
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
      swaggerOptions: {
        docExpansion: 'none',
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        requestInterceptor: (request: any) => {
          const token = localStorage.getItem('jwtToken');
          if (token) {
            request.headers['Authorization'] = `Bearer ${token}`;
          }
          return request;
        },
        responseInterceptor: (response: any) => {
          if (response.config?.url?.includes('/auth/login') && response.status === 200) {
            const token = response.data.token;
            localStorage.setItem('jwtToken', token);
          }
          return response;
        },
      },
    })
  );
};
