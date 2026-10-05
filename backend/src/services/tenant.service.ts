import mongoose from 'mongoose';
import { Tenant, User, Subscription, SubscriptionPlan, AuditLog } from '../models';
import { UserRole, UserStatus, TenantStatus, SubscriptionStatus, BillingCycle } from '../constants';
import { AppError } from '../middlewares/errorHandler';

export class TenantService {
  static async createTenantWithAdmin(data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    address?: any;
    planId: string;
    rentAmount?: number;
    billingCycle?: BillingCycle;
    startDate?: string | Date;
    expiryDate?: string | Date;
    status?: TenantStatus;
  }, superAdminId: string) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'USER_EXISTS');
    }

    const plan = await SubscriptionPlan.findById(data.planId);
    if (!plan) {
      throw new AppError('Specified subscription plan does not exist', 404, 'PLAN_NOT_FOUND');
    }

    // Generate unique slug
    let baseSlug = data.businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await Tenant.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create User
      const [adminUser] = await User.create(
        [
          {
            name: data.ownerName,
            email: data.email.toLowerCase(),
            password: data.password,
            phone: data.phone,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
          },
        ],
        { session }
      );

      // 2. Create Tenant
      const [tenant] = await Tenant.create(
        [
          {
            businessName: data.businessName,
            slug,
            ownerId: adminUser._id,
            email: data.email.toLowerCase(),
            phone: data.phone,
            address: data.address,
            status: data.status || TenantStatus.ACTIVE,
          },
        ],
        { session }
      );

      // Link User to Tenant
      adminUser.tenantId = tenant._id as mongoose.Types.ObjectId;
      await adminUser.save({ session });

      // 3. Create Subscription
      const startDate = data.startDate ? new Date(data.startDate) : new Date();
      const cycle = data.billingCycle || plan.billingCycle || BillingCycle.MONTHLY;
      const days = cycle === BillingCycle.YEARLY ? 365 : cycle === BillingCycle.QUARTERLY ? 90 : 30;

      const expiry = data.expiryDate ? new Date(data.expiryDate) : new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      const graceEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days grace

      const [subscription] = await Subscription.create(
        [
          {
            tenantId: tenant._id,
            planId: plan._id,
            amount: data.rentAmount !== undefined ? data.rentAmount : plan.price,
            billingCycle: cycle,
            startDate,
            nextDueDate: expiry,
            expiryDate: expiry,
            gracePeriodEndDate: graceEnd,
            status: SubscriptionStatus.ACTIVE,
          },
        ],
        { session }
      );

      // 4. Audit Log
      await AuditLog.create(
        [
          {
            tenantId: tenant._id,
            userId: superAdminId,
            action: 'TENANT_CREATED',
            entity: 'Tenant',
            entityId: tenant._id,
            newValue: { businessName: tenant.businessName, slug: tenant.slug, email: tenant.email },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        tenant,
        adminUser: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          role: adminUser.role,
        },
        subscription,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async listTenants(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.$or = [
        { businessName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [tenants, total] = await Promise.all([
      Tenant.find(filter)
        .populate('ownerId', 'name email phone status')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit),
      Tenant.countDocuments(filter),
    ]);

    // Attach current subscription to each tenant
    const tenantIds = tenants.map((t) => t._id);
    const subscriptions = await Subscription.find({ tenantId: { $in: tenantIds } }).populate('planId');
    const subMap = new Map(subscriptions.map((s) => [s.tenantId.toString(), s]));

    const items = tenants.map((t) => {
      const sub = subMap.get(t._id.toString());
      return {
        id: t._id,
        businessName: t.businessName,
        slug: t.slug,
        owner: t.ownerId,
        email: t.email,
        phone: t.phone,
        status: t.status,
        logo: t.logo,
        createdAt: t.createdAt,
        subscription: sub ? {
          planName: (sub.planId as any)?.name || 'Custom',
          status: sub.status,
          nextDueDate: sub.nextDueDate,
          amount: sub.amount,
        } : null,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTenantById(id: string) {
    const tenant = await Tenant.findById(id).populate('ownerId', 'name email phone status createdAt');
    if (!tenant) throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');

    const subscription = await Subscription.findOne({ tenantId: id }).populate('planId');

    return { tenant, subscription };
  }

  static async updateTenant(id: string, updateData: any) {
    const tenant = await Tenant.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!tenant) throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    return tenant;
  }

  static async setTenantStatus(id: string, status: TenantStatus, superAdminId: string) {
    const tenant = await Tenant.findById(id);
    if (!tenant) throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');

    const oldStatus = tenant.status;
    tenant.status = status;
    await tenant.save();

    // Also sync User status and Subscription status if suspended
    if (status === TenantStatus.SUSPENDED) {
      await User.updateMany({ tenantId: id }, { status: UserStatus.SUSPENDED });
      await Subscription.updateOne({ tenantId: id }, { status: SubscriptionStatus.SUSPENDED });
    } else if (status === TenantStatus.ACTIVE) {
      await User.updateMany({ tenantId: id }, { status: UserStatus.ACTIVE });
      await Subscription.updateOne({ tenantId: id }, { status: SubscriptionStatus.ACTIVE });
    }

    await AuditLog.create({
      tenantId: tenant._id,
      userId: superAdminId,
      action: status === TenantStatus.SUSPENDED ? 'TENANT_SUSPENDED' : 'TENANT_ACTIVATED',
      entity: 'Tenant',
      entityId: tenant._id,
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    return tenant;
  }
}
