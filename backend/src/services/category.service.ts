import { Category } from '../models';
import { AppError } from '../middlewares/errorHandler';

export class CategoryService {
  static async getCategories(tenantId: string, status?: string) {
    const filter: any = { tenantId };
    if (status) filter.status = status;
    return Category.find(filter).sort({ sortOrder: 1, name: 1 });
  }

  static async createCategory(tenantId: string, data: any) {
    return Category.create({
      ...data,
      tenantId,
    });
  }

  static async getCategoryById(tenantId: string, categoryId: string) {
    const category = await Category.findOne({ _id: categoryId, tenantId });
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }

  static async updateCategory(tenantId: string, categoryId: string, data: any) {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, tenantId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }

  static async deleteCategory(tenantId: string, categoryId: string) {
    const category = await Category.findOneAndDelete({ _id: categoryId, tenantId });
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return true;
  }
}
