import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return this.appService.healthCheck();
  }

  @Get('health-check')
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Get('/')
  home() {
    return this.appService.healthCheck();
  }
}
