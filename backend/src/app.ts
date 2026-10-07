import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows swagger UI and inline script tags in dev
    crossOriginEmbedderPolicy: false,
  })
);

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (for example, server-to-server requests)
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost =
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173';

      const isConfiguredFrontend =
        origin === ENV.FRONTEND_URL;

      // Allow your Restaurant SaaS Vercel frontend deployments
      const isRestaurantSaaSFrontend =
        /^https:\/\/restaurant-saa-s-frontend-[a-z0-9]+-manohars-projects-1b69d9f6\.vercel\.app$/.test(
          origin
        ) ||
        origin === 'https://restaurant-saa-s-frontend-rho.vercel.app';

      if (isLocalhost || isConfiguredFrontend || isRestaurantSaaSFrontend) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Versioned API Routes
app.use('/api/v1', routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
