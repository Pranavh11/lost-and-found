const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Keys', 'Wallets', 'Pets', 'Documents', 'Others'],
    default: 'Others'
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'claimed'],
    default: 'active'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
