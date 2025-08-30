import { FEATURE } from '@/consts';
import { SetMetadata } from '@nestjs/common';

export const Feature = (code: string) => SetMetadata(FEATURE, code);
