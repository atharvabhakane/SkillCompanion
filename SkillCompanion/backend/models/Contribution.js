const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Skill', 'Tool'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  contributorEmail: {
    type: String,
    required: true
  },
  reviewerNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  dataSource: {
    type: String,
    enum: ['google_sheets', 'local_file', null],
    default: null
  },
  externalId: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Contribution', ContributionSchema); 