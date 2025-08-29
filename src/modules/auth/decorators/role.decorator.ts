import { ROLES } from '@/consts';
import { SetMetadata } from '@nestjs/common';
import { TRole } from '@/modules/drizzle/schema';

export const Roles = (...roles: TRole[]) => SetMetadata(ROLES, roles);
