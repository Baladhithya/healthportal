const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  allergies: [{
    type: String,
    trim: true
  }],
  medications: [{
    type: String,
    trim: true
  }],
  bloodType: {
    type: String,
    maxlength: 5,
    trim: true
  },
  emergencyContactName: {
    type: String,
    maxlength: 100,
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    maxlength: 20,
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
