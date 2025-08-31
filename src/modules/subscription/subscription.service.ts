import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { calculateIntervalDate, generatePagination, getPage } from '@/utils';
import { eq, and, or, desc, gte, isNull, ilike, count, ne } from 'drizzle-orm';
import { Injectable, NotFoundException, ConflictException, Inject, UnprocessableEntityException } from '@nestjs/common';
import { SubscriptionFeature, Subscription, SubscriptionPlan, SubscriptionPlanFeature, TUser } from '../drizzle/schema';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async HandleCreateFeature(body: Dto.CreateFeatureBody) {
    const existingFeature = await this.db.query.SubscriptionFeature.findFirst({
      columns: { id: true },
      where: or(eq(SubscriptionFeature.name, body.name)),
    });

    if (existingFeature?.id) throw new ConflictException('feature with this name or code already exists');

    await this.db
      .insert(SubscriptionFeature)
      .values({ name: body.name, description: body.description, isActive: body.isActive ?? true })
      .returning();

    return {};
  }

  async HandleUpdateFeature(id: number, body: Dto.UpdateFeatureBody) {
    const existingFeature = await this.db.query.SubscriptionFeature.findFirst({
      columns: { id: true },
      where: eq(SubscriptionFeature.id, id),
    });

    if (!existingFeature?.id) throw new NotFoundException('feature not found');

    const feature = await this.db.query.SubscriptionFeature.findFirst({
      columns: { id: true },
      where: and(eq(SubscriptionFeature.name, body.name), ne(SubscriptionFeature.id, id)),
    });

    if (feature?.id) throw new ConflictException('feature with this name/code already exists');

    await this.db
      .update(SubscriptionFeature)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(SubscriptionFeature.id, id))
      .returning();
  }

  async HandleDeleteFeature(id: number) {
    const existingFeature = await this.db.query.SubscriptionFeature.findFirst({
      columns: { id: true },
      where: eq(SubscriptionFeature.id, id),
    });

    if (!existingFeature?.id) throw new NotFoundException('Feature not found');

    await this.db.delete(SubscriptionFeature).where(eq(SubscriptionFeature.id, id));
    return {};
  }

  async HandleGetFeatures(query: Dto.GetFeaturesQuery) {
    const q = `%${query?.q}%`;
    const { limit, offset } = getPage(query);
    const activeFilter = query?.isActive !== undefined ? eq(SubscriptionFeature.isActive, !!query.isActive) : undefined;

    const queryFilter = query?.q
      ? or(ilike(SubscriptionFeature.name, q), ilike(SubscriptionFeature.description, q))
      : undefined;

    const [stats] = await this.db
      .select({ count: count(SubscriptionFeature.id) })
      .from(SubscriptionFeature)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.SubscriptionFeature.findMany({
      limit,
      offset,
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async HandleGetFeatureById(id: number) {
    const data = await this.db.query.SubscriptionFeature.findFirst({
      where: and(eq(SubscriptionFeature.id, id), isNull(SubscriptionFeature.deletedAt)),
    });

    if (!data) throw new NotFoundException('Feature not found');
    return data;
  }

  async HandleCreateSubscriptionPlan(body: Dto.CreateSubscriptionPlanBody) {
    const existingSubscriptionPlan = await this.db.query.SubscriptionPlan.findFirst({
      columns: { id: true },
      where: eq(SubscriptionPlan.name, body.name),
    });

    if (existingSubscriptionPlan?.id) throw new ConflictException('Subscription plan with this name already exists');

    await this.db.transaction(async (tx) => {
      const [subscriptionPlan] = await tx
        .insert(SubscriptionPlan)
        .values({
          name: body.name,
          price: body.price,
          currency: body.currencyId,
          description: body.description,
          intervalUnit: body.intervalUnit,
          isActive: body.isActive ?? true,
          intervalCount: body.intervalCount,
        })
        .returning();

      for (const featureId of body.featureIds) {
        await tx.insert(SubscriptionPlanFeature).values({
          featureId,
          planId: subscriptionPlan.id,
        });
      }
    });

    return {};
  }

  async HandleUpdateSubscriptionPlan(id: number, body: Dto.UpdateSubscriptionPlanBody) {
    const existingSubscriptionPlan = await this.db.query.SubscriptionPlan.findFirst({
      columns: { id: true },
      where: eq(SubscriptionPlan.id, id),
    });

    if (!existingSubscriptionPlan?.id) throw new NotFoundException('Subscription plan not found');

    const subscriptionPlan = await this.db.query.SubscriptionPlan.findFirst({
      columns: { id: true },
      where: or(eq(SubscriptionPlan.id, id), eq(SubscriptionPlan.name, body.name || '')),
    });

    if (subscriptionPlan?.id) throw new ConflictException('Subscription plan with this name already exists');

    await this.db.transaction(async (tx) => {
      const [subscriptionPlan] = await tx
        .update(SubscriptionPlan)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(SubscriptionPlan.id, id))
        .returning();

      if (body.featureIds) {
        for (const featureId of body.featureIds) {
          await tx
            .insert(SubscriptionPlanFeature)
            .values({ featureId, planId: subscriptionPlan.id })
            .onConflictDoNothing();
        }
      }
    });

    return {};
  }

  async HandleDeleteSubscriptionPlan(id: number) {
    const existingSubscriptionPlan = await this.db.query.SubscriptionPlan.findFirst({
      columns: { id: true },
      where: eq(SubscriptionPlan.id, id),
    });

    if (!existingSubscriptionPlan?.id) throw new NotFoundException('Subscription plan not found');

    await this.db.delete(SubscriptionPlanFeature).where(eq(SubscriptionPlanFeature.planId, id));
    await this.db.delete(SubscriptionPlan).where(eq(SubscriptionPlan.id, id));
    return {};
  }

  async HandleSubscribe(user: TUser, body: Dto.SubscribeBody) {
    const plan = await this.db.query.SubscriptionPlan.findFirst({ where: eq(SubscriptionPlan.id, body.id) });
    if (!plan?.id) throw new NotFoundException();

    await this.db.transaction(async (tx) => {
      await tx
        .update(Subscription)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(
          and(
            eq(Subscription.userId, user.id),
            eq(Subscription.status, 'active'),
            gte(Subscription.expiredAt, new Date()),
          ),
        );

      const expiredAt = calculateIntervalDate(plan.intervalUnit, plan.intervalCount);

      await tx
        .insert(Subscription)
        .values({ userId: user.id, planId: plan.id, status: 'active', expiredAt })
        .returning();
    });
  }

  async HandleGetSubscriptionPlans(query: Dto.GetSubscriptionPlansQuery) {
    const q = `%${query?.q}%`;
    const { limit, offset } = getPage(query);

    const activeFilter = query?.isActive !== undefined ? eq(SubscriptionPlan.isActive, !!query.isActive) : undefined;
    const queryFilter = query?.q
      ? or(ilike(SubscriptionPlan.name, q), ilike(SubscriptionPlan.description, q))
      : undefined;

    const [stats] = await this.db
      .select({ count: count(SubscriptionPlan.id) })
      .from(SubscriptionPlan)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.SubscriptionPlan.findMany({
      limit,
      offset,
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async HandleGetSubscriptionPlanById(id: number) {
    const data = await this.db.query.SubscriptionPlan.findFirst({
      with: { features: true },
      where: and(eq(SubscriptionPlan.id, id), isNull(SubscriptionPlan.deletedAt)),
    });

    if (!data) throw new NotFoundException('Subscription plan not found');
    return data;
  }

  async HandleCancelSubscription(user: TUser) {
    await this.db
      .update(Subscription)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(
        and(
          eq(Subscription.userId, user.id),
          eq(Subscription.status, 'active'),
          gte(Subscription.expiredAt, new Date()),
        ),
      );
  }

  async HandleGetSubscriptions(user: TUser, query: Dto.GetSubscriptionsQuery) {
    const { limit, offset } = getPage(query);

    const userFilter = eq(Subscription.userId, user.id);
    const activeFilter = query?.isActive ? eq(Subscription.status, 'active') : undefined;

    const [stats] = await this.db
      .select({ count: count(Subscription.id) })
      .from(Subscription)
      .where(and(userFilter, activeFilter));

    const data = await this.db.query.Subscription.findMany({
      limit,
      offset,
      where: and(userFilter, activeFilter),
      orderBy: desc(Subscription.createdAt),
      with: { plan: { with: { features: true } } },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async checkFeatureAccess(userId: number, featureName: string) {
    const feature = await this.db.query.SubscriptionFeature.findFirst({
      columns: { id: true, name: true },
      where: eq(SubscriptionFeature.name, featureName),
    });

    if (!feature?.id) throw new UnprocessableEntityException();

    const plans = await this.db.query.SubscriptionPlan.findMany({
      columns: { name: true },
      with: { features: { with: { feature: true } } },
      where: and(eq(SubscriptionPlan.isActive, true), eq(SubscriptionPlanFeature.featureId, feature.id)),
    });

    const subscription = await this.db.query.Subscription.findFirst({
      where: and(
        eq(Subscription.userId, userId),
        eq(Subscription.status, 'active'),
        gte(Subscription.expiredAt, new Date()),
      ),
      with: { plan: { with: { features: { with: { feature: true } } } } },
    });

    if (!subscription?.id) return { plans, feature, subscription, hasAccess: false };

    const features = subscription.plan.features.map((pf) => pf.feature.name);
    const hasAccess = features.includes(featureName);

    if (hasAccess) return { plans: [], feature, subscription, hasAccess: true };

    return { plans, feature, subscription, hasAccess: false };
  }
}
