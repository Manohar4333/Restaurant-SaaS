import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import {
  User,
  Tenant,
  SubscriptionPlan,
  Subscription,
  Category,
  Product,
  RestaurantTable,
  Customer,
  Order,
} from '../models';
import {
  UserRole,
  UserStatus,
  TenantStatus,
  SubscriptionStatus,
  BillingCycle,
  OrderStatus,
  OrderPaymentStatus,
  OrderPaymentMethod,
  TableStatus,
  ProductAvailability,
} from '../constants';

export async function runSeed() {
  console.log('[Seed] Starting database population...');

  // 1. Clean existing records
  await Promise.all([
    User.deleteMany({}),
    Tenant.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
    Subscription.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    RestaurantTable.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // 2. Create Super Admin
  const superAdmin = await User.create({
    name: 'Platform Super Admin',
    email: 'superadmin@example.com',
    password: 'ChangeMe123!',
    phone: '+91 99999 00000',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  });
  console.log('[Seed] Super Admin created: superadmin@example.com');

  // 3. Create Subscription Plans
  const [basicPlan, proPlan, premiumPlan] = await SubscriptionPlan.create([
    {
      name: 'Basic',
      description: 'Ideal for small cafes and quick-service diners',
      price: 999,
      billingCycle: BillingCycle.MONTHLY,
      features: ['Up to 10 Tables', 'Up to 50 Menu Items', 'QR Code Generation', 'Real-Time Order Notifications'],
      maxTables: 10,
      maxProducts: 50,
      status: 'ACTIVE',
    },
    {
      name: 'Professional',
      description: 'Perfect for established dining restaurants & bistros',
      price: 1999,
      billingCycle: BillingCycle.MONTHLY,
      features: ['Up to 30 Tables', 'Up to 200 Menu Items', 'Advanced Sales Reports', 'Real-Time Kitchen Display'],
      maxTables: 30,
      maxProducts: 200,
      status: 'ACTIVE',
    },
    {
      name: 'Premium',
      description: 'Comprehensive solution for multi-floor luxury hotels',
      price: 3999,
      billingCycle: BillingCycle.MONTHLY,
      features: ['Unlimited Tables', 'Unlimited Menu Items', 'Priority Support', 'Exportable Accounting Reports'],
      maxTables: 100,
      maxProducts: 1000,
      status: 'ACTIVE',
    },
  ]);
  console.log('[Seed] Subscription plans created.');

  // 4. Create Tenant A: Royal Spice Restaurant
  const adminA = await User.create({
    name: 'Rajesh Sharma',
    email: 'admin@royalspice.com',
    password: 'ChangeMe123!',
    phone: '+91 98765 43210',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });

  const tenantA = await Tenant.create({
    businessName: 'Royal Spice Restaurant',
    slug: 'royal-spice',
    ownerId: adminA._id,
    email: 'contact@royalspice.com',
    phone: '+91 98765 43210',
    address: {
      street: '45 Heritage Boulevard, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
    },
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    currency: 'INR',
    taxPercentage: 5.0,
    status: TenantStatus.ACTIVE,
  });

  adminA.tenantId = tenantA._id as any;
  await adminA.save();

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const graceEnd = new Date(nextMonth.getTime() + 3 * 24 * 60 * 60 * 1000);

  await Subscription.create({
    tenantId: tenantA._id,
    planId: proPlan._id,
    amount: proPlan.price,
    billingCycle: BillingCycle.MONTHLY,
    startDate: now,
    nextDueDate: nextMonth,
    expiryDate: nextMonth,
    gracePeriodEndDate: graceEnd,
    status: SubscriptionStatus.ACTIVE,
  });

  // Categories for Tenant A
  const catNamesA = ['Starters', 'Biryani & Rice', 'Main Course', 'Breads', 'Beverages & Desserts'];
  const categoriesA = await Category.create(
    catNamesA.map((name, idx) => ({
      tenantId: tenantA._id,
      name,
      sortOrder: idx + 1,
      status: 'ACTIVE',
    }))
  );

  // 10 Products for Tenant A
  const productsAData = [
    { cat: 'Starters', name: 'Paneer Tikka', price: 240, desc: 'Charcoal-grilled cottage cheese with mint glaze' },
    { cat: 'Starters', name: 'Chicken Seekh Kebab', price: 290, desc: 'Minced chicken skewers infused with aromatic spices' },
    { cat: 'Biryani & Rice', name: 'Hyderabadi Dum Biryani (Chicken)', price: 340, desc: 'Slow-cooked fragrant basmati rice with tender spiced chicken' },
    { cat: 'Biryani & Rice', name: 'Royal Veg Biryani', price: 260, desc: 'Basmati rice layered with garden vegetables and saffron' },
    { cat: 'Main Course', name: 'Butter Chicken Masala', price: 360, desc: 'Classic tandoori chicken cooked in rich velvety tomato makhani' },
    { cat: 'Main Course', name: 'Dal Makhani', price: 250, desc: 'Slow-simmered black lentils tempered with churned butter' },
    { cat: 'Breads', name: 'Butter Naan', price: 60, desc: 'Crisp layered tandoori bread brushed with butter' },
    { cat: 'Breads', name: 'Garlic Roti', price: 50, desc: 'Whole wheat flatbread topped with toasted garlic flakes' },
    { cat: 'Beverages & Desserts', name: 'Kesar Mango Lassi', price: 120, desc: 'Chilled sweet yogurt smoothie with Alphonso mango' },
    { cat: 'Beverages & Desserts', name: 'Gulab Jamun (2 pcs)', price: 90, desc: 'Warm milk dumplings soaked in cardamom sugar syrup' },
  ];

  const productsA = await Promise.all(
    productsAData.map((p) => {
      const cat = categoriesA.find((c) => c.name === p.cat);
      return Product.create({
        tenantId: tenantA._id,
        categoryId: cat!._id,
        name: p.name,
        price: p.price,
        description: p.desc,
        availability: ProductAvailability.AVAILABLE,
        status: 'ACTIVE',
        isPopular: true,
      });
    })
  );

  // 5 Tables for Tenant A
  const tablesA = await Promise.all(
    ['1', '2', '3', '4', '5'].map((tableNumber) =>
      RestaurantTable.create({
        tenantId: tenantA._id,
        tableNumber: `T-${tableNumber}`,
        capacity: 4,
        status: tableNumber === '1' ? TableStatus.OCCUPIED : TableStatus.AVAILABLE,
      })
    )
  );

  // Customers & Sample Orders for Tenant A
  const custA1 = await Customer.create({
    tenantId: tenantA._id,
    name: 'Amit Patel',
    phone: '9820011223',
    email: 'amit.patel@gmail.com',
  });
  const custA2 = await Customer.create({
    tenantId: tenantA._id,
    name: 'Pooja Verma',
    phone: '9845099887',
    email: 'pooja.verma@gmail.com',
  });

  // Seed sample orders for Tenant A
  await Order.create({
    orderNumber: '#1001',
    tenantId: tenantA._id,
    customerId: custA1._id,
    tableId: tablesA[0]._id,
    items: [
      { productId: productsA[2]._id, productName: productsA[2].name, price: 340, quantity: 2, subtotal: 680 },
      { productId: productsA[8]._id, productName: productsA[8].name, price: 120, quantity: 2, subtotal: 240 },
    ],
    subtotal: 920,
    tax: 46,
    discount: 0,
    totalAmount: 966,
    paymentMethod: OrderPaymentMethod.PAY_AT_RESTAURANT,
    paymentStatus: OrderPaymentStatus.PAID,
    orderStatus: OrderStatus.COMPLETED,
  });

  await Order.create({
    orderNumber: '#1002',
    tenantId: tenantA._id,
    customerId: custA2._id,
    tableId: tablesA[1]._id,
    items: [
      { productId: productsA[0]._id, productName: productsA[0].name, price: 240, quantity: 1, subtotal: 240 },
      { productId: productsA[4]._id, productName: productsA[4].name, price: 360, quantity: 1, subtotal: 360 },
      { productId: productsA[6]._id, productName: productsA[6].name, price: 60, quantity: 3, subtotal: 180 },
    ],
    subtotal: 780,
    tax: 39,
    discount: 0,
    totalAmount: 819,
    paymentMethod: OrderPaymentMethod.PAY_AT_RESTAURANT,
    paymentStatus: OrderPaymentStatus.PENDING,
    orderStatus: OrderStatus.PREPARING,
  });

  // 5. Create Tenant B: Bella Italia Bistro
  const adminB = await User.create({
    name: 'Marco Rossi',
    email: 'admin@bellaitalia.com',
    password: 'ChangeMe123!',
    phone: '+91 97111 22334',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });

  const tenantB = await Tenant.create({
    businessName: 'Bella Italia Bistro',
    slug: 'bella-italia',
    ownerId: adminB._id,
    email: 'ciao@bellaitalia.com',
    phone: '+91 97111 22334',
    address: {
      street: '12 Piazza Avenue, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    currency: 'INR',
    taxPercentage: 5.0,
    status: TenantStatus.ACTIVE,
  });

  adminB.tenantId = tenantB._id as any;
  await adminB.save();

  await Subscription.create({
    tenantId: tenantB._id,
    planId: basicPlan._id,
    amount: basicPlan.price,
    billingCycle: BillingCycle.MONTHLY,
    startDate: now,
    nextDueDate: nextMonth,
    expiryDate: nextMonth,
    gracePeriodEndDate: graceEnd,
    status: SubscriptionStatus.ACTIVE,
  });

  // Categories for Tenant B
  const catNamesB = ['Antipasti', 'Artisan Pizzas', 'Handmade Pasta', 'Paninis & Mains', 'Dolci & Cafes'];
  const categoriesB = await Category.create(
    catNamesB.map((name, idx) => ({
      tenantId: tenantB._id,
      name,
      sortOrder: idx + 1,
      status: 'ACTIVE',
    }))
  );

  // 10 Products for Tenant B
  const productsBData = [
    { cat: 'Antipasti', name: 'Bruschetta al Pomodoro', price: 210, desc: 'Grilled sourdough topped with seasoned tomatoes and fresh basil' },
    { cat: 'Antipasti', name: 'Crispy Calamari Fritti', price: 320, desc: 'Golden flash-fried squid served with lemon caper aioli' },
    { cat: 'Artisan Pizzas', name: 'Pizza Margherita DOC', price: 380, desc: 'San Marzano tomatoes, fior di latte mozzarella, and fresh basil' },
    { cat: 'Artisan Pizzas', name: 'Quattro Formaggi', price: 460, desc: 'Gorgonzola, mozzarella, fontina, and Parmigiano-Reggiano' },
    { cat: 'Handmade Pasta', name: 'Fettuccine Alfredo with Truffle', price: 420, desc: 'Handcrafted pasta ribbons tossed in Parmesan butter cream' },
    { cat: 'Handmade Pasta', name: 'Spaghetti Carbonara', price: 440, desc: 'Traditional Italian sauce with cured pancetta, egg yolks, and pecorino' },
    { cat: 'Paninis & Mains', name: 'Chicken Parmigiana', price: 410, desc: 'Crispy chicken breast topped with marinara and melted mozzarella' },
    { cat: 'Paninis & Mains', name: 'Pesto Caprese Panini', price: 290, desc: 'Pressed ciabatta with buffalo mozzarella, vine tomatoes, and basil pesto' },
    { cat: 'Dolci & Cafes', name: 'Traditional Tiramisu', price: 260, desc: 'Espresso-soaked savoiardi layered with mascarpone cream' },
    { cat: 'Dolci & Cafes', name: 'Double Espresso Italiano', price: 140, desc: 'Rich and dark roasted Italian espresso blend' },
  ];

  await Promise.all(
    productsBData.map((p) => {
      const cat = categoriesB.find((c) => c.name === p.cat);
      return Product.create({
        tenantId: tenantB._id,
        categoryId: cat!._id,
        name: p.name,
        price: p.price,
        description: p.desc,
        availability: ProductAvailability.AVAILABLE,
        status: 'ACTIVE',
        isPopular: true,
      });
    })
  );

  // 5 Tables for Tenant B
  await Promise.all(
    ['1', '2', '3', '4', '5'].map((tableNumber) =>
      RestaurantTable.create({
        tenantId: tenantB._id,
        tableNumber: `Table ${tableNumber}`,
        capacity: 2 + parseInt(tableNumber, 10),
        status: TableStatus.AVAILABLE,
      })
    )
  );

  console.log('[Seed] Database populated successfully with 2 tenants, 10 categories, 20 products, 10 tables, and test orders!');
}

if (require.main === module) {
  connectDatabase()
    .then(runSeed)
    .then(() => disconnectDatabase())
    .then(() => {
      console.log('[Seed] Finished. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
