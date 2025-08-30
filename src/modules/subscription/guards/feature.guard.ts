import { Reflector } from '@nestjs/core';
import { TUser } from '@/modules/drizzle/schema';
import { SubscriptionService } from '../subscription.service';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>('requiredFeature', context.getHandler());

    if (!requiredFeature) return true;

    const req = context.switchToHttp().getRequest();
    const user: TUser = req.user;

    if (!user?.id) throw new UnauthorizedException();

    const res = await this.subscriptionService.checkFeatureAccess(user.id, requiredFeature);
    if (res.hasAccess) return true;

    const plans = res.plans.map((p) => p.name).join(' or ');
    const upgrade = `Upgrade to ${plans} to access this feature`;
    const subscribe = `Subscribe to ${plans} to access this feature.`;
    const message = 'Access denied: This feature requires an active subscription.';

    if (!res.subscription) {
      if (plans.length) throw new ForbiddenException(subscribe);
      throw new ForbiddenException(message);
    }

    if (plans.length) throw new ForbiddenException(upgrade);
    throw new ForbiddenException();
  }
}
