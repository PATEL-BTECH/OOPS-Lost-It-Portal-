/**
 * AuditLog Model
 * Records security-sensitive operations by administrators and staff
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CLAIM_APPROVED',
        'CLAIM_REJECTED',
        'HANDOVER_RECORDED',
        'USER_BLOCKED',
        'USER_UNBLOCKED',
        'USER_ROLE_PROMOTED',
        'CATEGORY_CREATED',
        'ANNOUNCEMENT_POSTED',
        'ANNOUNCEMENT_DELETED',
        'ITEM_MODERATED'
      ]
    },
    details: {
      type: String,
      required: true
    },
    targetResource: {
      type: String,
      default: ''
    },
    targetId: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
