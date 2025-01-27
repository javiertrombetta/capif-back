import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

import {  
  authSchemas,  
  userSchemas,
  producersSchemas,
  repertoiresSchemas,
  conflictsSchemas,
  cashflowSchemas,
  auditsSchemas,
} from './schemas';
import packageJson from '../../package.json';

import { authSwaggerDocs } from '../docs/authSwagger';
import { usersSwaggerDocs } from '../docs/usersSwagger';
import { producersSwaggerDocs } from '../docs/producersSwagger';
import { repertoiresSwaggerDocs } from '../docs/repertoiresSwagger';
import { conflictsSwaggerDocs } from '../docs/conflictsSwagger';
import { cashflowSwaggerDocs } from '../docs/cashflowSwagger';
import { auditsSwaggerDocs } from '../docs/auditsSwagger';

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
        ...authSchemas,
        ...userSchemas,
        ...producersSchemas,
        ...repertoiresSchemas,
        ...conflictsSchemas,
        ...cashflowSchemas,
        ...auditsSchemas,
      },
    },
    servers: [
      {
        url: `${DOMAIN}:${PORT}/${GLOBAL_PREFIX}`,
      },
    ],
    tags: [
      ...authSwaggerDocs.tags,
      ...usersSwaggerDocs.tags,
      ...producersSwaggerDocs.tags,
      ...repertoiresSwaggerDocs.tags,
      ...conflictsSwaggerDocs.tags,
      ...cashflowSwaggerDocs.tags,
      ...auditsSwaggerDocs.tags,
    ],
    paths: {
      ...authSwaggerDocs.paths,
      ...usersSwaggerDocs.paths,
      ...producersSwaggerDocs.paths,
      ...repertoiresSwaggerDocs.paths,
      ...conflictsSwaggerDocs.paths,
      ...cashflowSwaggerDocs.paths,
      ...auditsSwaggerDocs.paths,
    },
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
        operationsSorter: (a: any, b: any) => {
          // Orden de los métodos HTTP
          const order = ['post', 'get', 'put', 'delete'];
          
          // Obtener los índices de los métodos
          const aMethodIndex = order.indexOf(a.get('method'));
          const bMethodIndex = order.indexOf(b.get('method'));

          // Si los métodos son diferentes, ordenar por el índice del método
          if (aMethodIndex !== bMethodIndex) {
            return aMethodIndex - bMethodIndex;
          }

          // Si los métodos son iguales, invertir el orden alfabético por ruta
          return b.get('path').localeCompare(a.get('path'));
        },
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
