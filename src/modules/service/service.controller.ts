import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { ServiceService } from './service.service';
import { Auth as AuthGuard } from '../auth/decorators/auth.decorator';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Version } from '@nestjs/common';

@Controller('/service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('/:id')
  @Version(VERSION_ONE)
  async getServiceById(@Param('id') id: number) {
    const data = await this.serviceService.getServiceById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Put('/:id')
  @Version(VERSION_ONE)
  @AuthGuard({ roles: ['admin'] })
  async updateService(@Param('id') id: number, @Body() body: Dto.UpdateServiceBody) {
    const data = await this.serviceService.updateService(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Delete('/:id')
  @Version(VERSION_ONE)
  @AuthGuard({ roles: ['admin'] })
  async deleteService(@Param('id') id: number) {
    const data = await this.serviceService.deleteService(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Post()
  @Version(VERSION_ONE)
  @AuthGuard({ roles: ['admin'] })
  async createService(@Body() body: Dto.CreateServiceBody) {
    const data = await this.serviceService.createService(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Version(VERSION_ONE)
  async getServices(@Query() query: Dto.GetServicesQuery) {
    const data = await this.serviceService.getServices(query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
