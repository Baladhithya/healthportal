const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const auditLogger = require('../middleware/auditLogger');
const User = require('../models/User');
const WellnessGoal = require('../models/WellnessGoal');
const Reminder = require('../models/Reminder');
const AssignmentRequest = require('../models/AssignmentRequest');
const PatientProfile = require('../models/PatientProfile');

const router = express.Router();

// All provider routes require auth + provider role
router.use(auth, roleCheck('provider'));

// ─── GET /api/provider/patients ─────────────────────────────────────
router.get(
  '/patients',
  auditLogger('VIEW_PATIENT_LIST', 'provider_dashboard'),
  async (req, res) => {
    try {
      // Find patients assigned to this provider
      const patients = await User.find({
        role: 'patient',
        assignedProviderIds: req.user.userId,
      }).select('firstName lastName email createdAt');

      // Calculate compliance for each patient
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const patientData = await Promise.all(
        patients.map(async (patient) => {
          const goals = await WellnessGoal.find({
            userId: patient._id,
            date: { $gte: weekAgo, $lte: today },
          });

          const reminders = await Reminder.find({
            userId: patient._id,
            dueDate: { $lt: today },
            completed: false,
          });

          const goalsMet = goals.filter((g) => g.met).length;
          const goalsTotal = goals.length;
          const missedCheckups = reminders.length;

          let status = 'No Data';
          if (goalsTotal > 0) {
            const ratio = goalsMet / goalsTotal;
            if (ratio >= 0.7 && missedCheckups === 0) status = 'On Track';
            else if (ratio >= 0.4) status = 'Needs Attention';
            else status = 'At Risk';
          }

          return {
            id: patient._id,
            name: `${patient.firstName} ${patient.lastName}`,
            email: patient.email,
            compliance: {
              goalsMetThisWeek: goalsMet,
              goalsTotalThisWeek: goalsTotal,
              missedCheckups,
              status,
            },
          };
        })
      );

      res.json(patientData);
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/provider/patients/:id ─────────────────────────────────
router.get(
  '/patients/:id',
  auditLogger('VIEW_PATIENT_DETAIL', 'provider_dashboard'),
  async (req, res) => {
    try {
      // Verify patient is assigned to this provider
      const patient = await User.findOne({
        _id: req.params.id,
        role: 'patient',
        assignedProviderIds: req.user.userId,
      }).select('firstName lastName email dateOfBirth');

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found or not assigned to you.' });
      }

      // Get last 30 days of goals
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const goals = await WellnessGoal.find({
        userId: patient._id,
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 });

      const reminders = await Reminder.find({
        userId: patient._id,
      }).sort({ dueDate: 1 });

      const profileData = await PatientProfile.findOne({ userId: patient._id }).lean();

      res.json({
        patient: {
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth,
        },
        profile: profileData,
        goals,
        reminders,
      });
    } catch (error) {
      console.error('Get patient detail error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/provider/available-patients ───────────────────────────
router.get(
  '/available-patients',
  async (req, res) => {
    try {
      const patients = await User.find({
        role: 'patient',
        assignedProviderIds: { $ne: req.user.userId }
      }).select('firstName lastName email');
      res.json(patients);
    } catch (error) {
      console.error('Available patients error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/provider/assignment-requests ────────────────────────
router.get(
  '/assignment-requests',
  async (req, res) => {
    try {
      const requests = await AssignmentRequest.find({
        providerId: req.user.userId,
        status: 'pending'
      }).populate('patientId', 'firstName lastName email dateOfBirth');
      
      res.json(requests);
    } catch (error) {
      console.error('Get assignment requests error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── PUT /api/provider/assignment-requests/:id/respond ─────────────
router.put(
  '/assignment-requests/:id/respond',
  auditLogger('RESPOND_ASSIGNMENT_REQUEST', 'provider_dashboard'),
  async (req, res) => {
    try {
      const { status } = req.body; // 'accepted' or 'rejected'
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const assignmentReq = await AssignmentRequest.findOne({
        _id: req.params.id,
        providerId: req.user.userId,
        status: 'pending'
      });

      if (!assignmentReq) {
        return res.status(404).json({ error: 'Pending request not found' });
      }

      assignmentReq.status = status;
      assignmentReq.updatedAt = new Date();
      await assignmentReq.save();

      // If accepted, add patient to provider's list and provider to patient's list
      if (status === 'accepted') {
        const patient = await User.findById(assignmentReq.patientId);
        if (patient && !patient.assignedProviderIds.includes(req.user.userId)) {
          patient.assignedProviderIds.push(req.user.userId);
          await patient.save();
        }
      }

      res.json({ success: true, request: assignmentReq });
    } catch (error) {
      console.error('Respond assignment request error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── PUT /api/provider/profile ──────────────────────────────────────
router.put(
  '/profile',
  auditLogger('UPDATE_PROVIDER_PROFILE', 'provider_profile'),
  async (req, res) => {
    try {
      const { hospitalName, mobileNumber } = req.body;
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      if (hospitalName !== undefined) user.hospitalName = hospitalName;
      if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;

      await user.save();

      res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        hospitalName: user.hospitalName,
        mobileNumber: user.mobileNumber,
        licenseKey: user.licenseKey
      });
    } catch (error) {
      console.error('Update provider profile error:', error);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  }
);

module.exports = router;
