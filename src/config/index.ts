import 'dotenv/config';
import { ValidationError } from 'class-validator';
import { ValidationPipeOptions } from '@nestjs/common/pipes';
import { BadRequestException } from '@nestjs/common/exceptions';

export default () => {
  return {
    VALIDATION_PIPE_OPTIONS: {
      whitelist: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException(
          errors[0]?.constraints?.[Object.keys(errors[0].constraints)[0]],
        );
      },
    } as ValidationPipeOptions,
  };
};
