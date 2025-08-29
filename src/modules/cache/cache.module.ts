import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as BaseCacheModule } from '@nestjs/cache-manager';

@Module({ imports: [BaseCacheModule.register()], exports: [CacheService], providers: [CacheService] })
export class CacheModule {}
