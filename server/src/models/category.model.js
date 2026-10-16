/**
 * Category Model
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [60, 'Category name cannot exceed 60 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    icon: {
      type: String,
      default: 'Tag'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
