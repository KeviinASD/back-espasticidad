import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('CORS');

  // Manejar OPTIONS requests ANTES de configurar CORS (para asegurar que se procesen)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;
      const allowedOrigins = process.env.FRONTEND_URL?.split(',').map(url => url.trim()) || [];
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      // Verificar si el origin está permitido
      let isAllowed = false;
      if (!origin) {
        isAllowed = true; // Apps móviles, Postman, etc.
      } else if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        // Permitir localhost en cualquier entorno (útil para desarrollo y pruebas locales en producción)
        isAllowed = true;
      } else if (allowedOrigins.includes(origin)) {
        isAllowed = true;
      }

      if (isAllowed || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 horas
        return res.status(200).end();
      } else {
        logger.error(`Blocked OPTIONS request from disallowed origin: ${origin}`);
        logger.debug(`Allowed origins: ${allowedOrigins.join(', ')}`);
        return res.status(403).end();
      }
    }
    next();
  });

  // Configurar CORS para requests normales
  const corsOptions = {
    origin: (origin, callback) => {
      // Permitir requests sin origin (como apps móviles, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = process.env.FRONTEND_URL?.split(',').map(url => url.trim()) || [];
      
      // Permitir localhost en cualquier entorno (útil para desarrollo y pruebas locales)
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
        return;
      }
      
      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.error(`Blocked CORS request from disallowed origin: ${origin}`);
        logger.debug(`Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      });
      return new BadRequestException({
        message: 'Error de validación',
        errors: messages,
      });
    },
  }));

  /* Configurando Swagger */
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation for the application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

  await app.listen(Number(process.env.PORT) || 3030);
}
bootstrap();
