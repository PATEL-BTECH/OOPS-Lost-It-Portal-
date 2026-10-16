/**
 * User Model
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    googleSub: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin', 'security'],
        message: 'Role must be student, admin, or security'
      },
      default: 'student'
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    studentId: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to format public safe user profile
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profileImage: this.profileImage,
    role: this.role,
    emailVerified: this.emailVerified,
    isBlocked: this.isBlocked,
    phone: this.phone,
    department: this.department,
    studentId: this.studentId,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
