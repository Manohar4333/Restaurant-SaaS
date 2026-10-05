import { Request, Response, NextFunction } from 'express';
import { Tenant, Category, Product, RestaurantTable } from '../models';
import { ApiResponse } from '../utils/apiResponse';
import { ProductAvailability } from '../constants';
import { AppError } from '../middlewares/errorHandler';

export class PublicController {
  static async getRestaurantBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findOne({ slug: req.params.slug.toLowerCase() });
      if (!tenant) throw new AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');

      return ApiResponse.success(res, 'Restaurant info fetched', {
        id: tenant._id,
        businessName: tenant.businessName,
        slug: tenant.slug,
        address: tenant.address,
        phone: tenant.phone,
        logo: tenant.logo,
        currency: tenant.currency,
        taxPercentage: tenant.taxPercentage,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findOne({ slug: req.params.slug.toLowerCase() });
      if (!tenant) throw new AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');

      const categories = await Category.find({ tenantId: tenant._id, status: 'ACTIVE' }).sort({ sortOrder: 1, name: 1 });
      return ApiResponse.success(res, 'Categories fetched', categories);
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findOne({ slug: req.params.slug.toLowerCase() });
      if (!tenant) throw new AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');

      const filter: any = {
        tenantId: tenant._id,
        status: 'ACTIVE',
      };

      if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId;
      }
      if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
      }

      const products = await Product.find(filter).populate('categoryId', 'name').sort({ name: 1 });
      return ApiResponse.success(res, 'Products fetched', products);
    } catch (error) {
      next(error);
    }
  }

  static async getProductDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findOne({ slug: req.params.slug.toLowerCase() });
      if (!tenant) throw new AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');

      const product = await Product.findOne({ _id: req.params.id, tenantId: tenant._id }).populate('categoryId', 'name');
      if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

      return ApiResponse.success(res, 'Product details fetched', product);
    } catch (error) {
      next(error);
    }
  }

  static async getTableByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findOne({ slug: req.params.slug.toLowerCase() });
      if (!tenant) throw new AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');

      const table = await RestaurantTable.findOne({ qrToken: req.params.qrToken, tenantId: tenant._id });
      if (!table) throw new AppError('Table QR token is invalid', 404, 'INVALID_TABLE');

      return ApiResponse.success(res, 'Table identified', {
        id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
      });
    } catch (error) {
      next(error);
    }
  }
}
