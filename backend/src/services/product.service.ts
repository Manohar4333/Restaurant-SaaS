import { Product, Category } from '../models';
import { AppError } from '../middlewares/errorHandler';
import { ProductAvailability } from '../constants';

export class ProductService {
  static async getProducts(
    tenantId: string,
    query: {
      categoryId?: string;
      availability?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const filter: any = { tenantId };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.availability) filter.availability = query.availability;
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

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

  static async createProduct(tenantId: string, data: any) {
    // Verify category belongs to same tenant
    const category = await Category.findOne({ _id: data.categoryId, tenantId });
    if (!category) {
      throw new AppError('Invalid category for this restaurant', 400, 'INVALID_CATEGORY');
    }

    return Product.create({
      ...data,
      tenantId,
    });
  }

  static async getProductById(tenantId: string, productId: string) {
    const product = await Product.findOne({ _id: productId, tenantId }).populate('categoryId', 'name');
    if (!product) throw new AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  static async updateProduct(tenantId: string, productId: string, data: any) {
    if (data.categoryId) {
      const category = await Category.findOne({ _id: data.categoryId, tenantId });
      if (!category) {
        throw new AppError('Invalid category for this restaurant', 400, 'INVALID_CATEGORY');
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, tenantId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!product) throw new AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  static async toggleAvailability(tenantId: string, productId: string, availability?: ProductAvailability) {
    const product = await Product.findOne({ _id: productId, tenantId });
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

    const newStatus = availability || (product.availability === ProductAvailability.AVAILABLE
      ? ProductAvailability.UNAVAILABLE
      : ProductAvailability.AVAILABLE);

    product.availability = newStatus;
    await product.save();
    return product;
  }

  static async deleteProduct(tenantId: string, productId: string) {
    const product = await Product.findOneAndDelete({ _id: productId, tenantId });
    if (!product) throw new AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
    return true;
  }
}
