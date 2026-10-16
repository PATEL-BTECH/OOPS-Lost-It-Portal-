/**
 * Category Controller & Seeder
 * Campus Lost & Found Portal
 */
const Category = require('../models/category.model');

const defaultCategories = [
  { name: 'University ID Cards', description: 'Student & Faculty ID cards, library passes, access badges', icon: 'CreditCard' },
  { name: 'Wallets & Keys', description: 'Money wallets, purses, room keys, motorbike/car keys', icon: 'Key' },
  { name: 'Earphones & Headphones', description: 'AirPods, earbuds, wired earphones, headphone cases', icon: 'Headphones' },
  { name: 'Electronics & Laptops', description: 'Laptops, chargers, USB drives, tablets, calculators', icon: 'Laptop' },
  { name: 'Books & Stationery', description: 'Textbooks, notebooks, pouches, geometry boxes', icon: 'BookOpen' },
  { name: 'Water Bottles', description: 'Flasks, water bottles, lunch boxes, containers', icon: 'Coffee' },
  { name: 'Bags & Backpacks', description: 'Backpacks, shoulder bags, tote bags, gym bags', icon: 'Briefcase' },
  { name: 'Documents & Certificates', description: 'Degree certificates, marksheets, hall tickets, govt IDs', icon: 'FileText' },
  { name: 'Other Personal Belongings', description: 'Spectacles, watches, umbrellas, clothing, miscellaneous', icon: 'Package' }
];

/**
 * Seed default categories if collection is empty
 */
const seedCategoriesIfEmpty = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(defaultCategories);
      console.log('✅ [Seeder] Seeded default university item categories.');
    }
  } catch (error) {
    console.warn('[Seeder Warning] Category seed notice:', error.message);
  }
};

/**
 * GET /api/categories
 * List all active categories
 */
const getCategories = async (req, res, next) => {
  try {
    await seedCategoriesIfEmpty();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories (Admin only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const category = await Category.create({ name, description, icon });
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  seedCategoriesIfEmpty
};
