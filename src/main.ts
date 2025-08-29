import { GLOBAL_PREFIX } from './consts';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ExceptionsFilter } from './interceptors/exception.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.getOrThrow('PORT');
  const validationPipeOptions = config.getOrThrow<any>('VALIDATION_PIPE_OPTIONS')!;

  app.enableCors({});
  app.useGlobalFilters(new ExceptionsFilter());
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.setGlobalPrefix(GLOBAL_PREFIX, {
    exclude: ['/', '/health', '/health-check'],
  });

  await app.listen(port);
}
bootstrap();
