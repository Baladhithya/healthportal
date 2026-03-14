const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const auditLogger = require('../middleware/auditLogger');
const PatientProfile = require('../models/PatientProfile');
const WellnessGoal = require('../models/WellnessGoal');
const Reminder = require('../models/Reminder');
const AssignmentRequest = require('../models/AssignmentRequest');

const router = express.Router();

// All patient routes require auth + patient role
router.use(auth, roleCheck('patient'));

// ─── Health Tips Pool ────────────────────────────────────────────────
const healthTips = [
  { tip: 'Aim for at least 30 minutes of moderate exercise daily. Walking counts!', category: 'Exercise' },
  { tip: 'Drink at least 8 glasses of water a day to stay hydrated.', category: 'Hydration' },
  { tip: 'Try to get 7-9 hours of sleep each night for optimal health.', category: 'Sleep' },
  { tip: 'Eat at least 5 servings of fruits and vegetables daily.', category: 'Nutrition' },
  { tip: 'Take short breaks every hour if you sit for long periods.', category: 'Posture' },
  { tip: 'Wash your hands frequently to prevent the spread of illness.', category: 'Hygiene' },
  { tip: 'Schedule regular preventive check-ups with your healthcare provider.', category: 'Preventive Care' },
  { tip: 'Practice deep breathing or meditation for 10 minutes daily to reduce stress.', category: 'Mental Health' },
  { tip: 'Limit screen time before bed to improve sleep quality.', category: 'Sleep' },
  { tip: 'Include omega-3 rich foods like salmon and walnuts in your diet.', category: 'Nutrition' },
  { tip: 'Maintain a healthy weight through balanced diet and regular exercise.', category: 'Wellness' },
  { tip: 'Don\'t skip breakfast — it jumpstarts your metabolism for the day.', category: 'Nutrition' },
  { tip: 'Keep track of your allergies and share them with your healthcare provider.', category: 'Safety' },
  { tip: 'Get your annual flu shot to protect yourself and others.', category: 'Preventive Care' },
];

// ─── GET /api/patient/profile ───────────────────────────────────────
router.get(
  '/profile',
  auditLogger('VIEW_PROFILE', 'patient_profile'),
  async (req, res) => {
    try {
      let profile = await PatientProfile.findOne({ userId: req.user.userId }).lean();
      if (!profile) {
        const newProfile = await PatientProfile.create({ userId: req.user.userId });
        profile = newProfile.toObject();
      }

      const User = require('../models/User');
      const user = await User.findById(req.user.userId).populate('assignedProviderIds', 'firstName lastName email hospitalName mobileNumber');
      profile.assignedProviders = user.assignedProviderIds;

      const pendingRequests = await AssignmentRequest.find({
        patientId: req.user.userId,
        status: 'pending'
      }).populate('providerId', 'firstName lastName email hospitalName mobileNumber');
      
      profile.pendingRequests = pendingRequests.map(req => req.providerId);

      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── PUT /api/patient/profile ───────────────────────────────────────
router.put(
  '/profile',
  auditLogger('UPDATE_PROFILE', 'patient_profile'),
  async (req, res) => {
    try {
      const { allergies, medications, bloodType, emergencyContactName, emergencyContactPhone } = req.body;

      const profile = await PatientProfile.findOneAndUpdate(
        { userId: req.user.userId },
        {
          ...(allergies !== undefined && { allergies }),
          ...(medications !== undefined && { medications }),
          ...(bloodType !== undefined && { bloodType }),
          ...(emergencyContactName !== undefined && { emergencyContactName }),
          ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
          updatedAt: Date.now(),
        },
        { new: true, upsert: true }
      );

      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── POST /api/patient/assignment-requests ──────────────────────────
router.post(
  '/assignment-requests',
  auditLogger('CREATE_ASSIGNMENT_REQUEST', 'patient_profile'),
  async (req, res) => {
    try {
      const { licenseKey } = req.body;
      if (!licenseKey) return res.status(400).json({ error: 'License key is required' });

      const User = require('../models/User');
      const provider = await User.findOne({ licenseKey, role: 'provider' });
      
      if (!provider) {
        return res.status(404).json({ error: 'No provider found with that license key' });
      }

      // Check if already assigned
      const me = await User.findById(req.user.userId);
      if (me.assignedProviderIds.includes(provider._id)) {
        return res.status(400).json({ error: 'You are already assigned to this provider' });
      }

      // Check if a pending request already exists
      const existingRequest = await AssignmentRequest.findOne({
        patientId: req.user.userId,
        providerId: provider._id,
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({ error: 'Assignment request already pending' });
      }

      const assignmentReq = await AssignmentRequest.create({
        patientId: req.user.userId,
        providerId: provider._id,
        status: 'pending'
      });

      res.status(201).json({ success: true, message: 'Assignment request sent', request: assignmentReq });
    } catch (error) {
      console.error('Create assignment request error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/patient/goals ─────────────────────────────────────────
router.get(
  '/goals',
  auditLogger('VIEW_GOALS', 'wellness_goal'),
  async (req, res) => {
    try {
      const filter = { userId: req.user.userId };

      // Filter by date if provided
      if (req.query.date) {
        const date = new Date(req.query.date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        filter.date = { $gte: date, $lt: nextDay };
      }

      // Filter by goalType if provided
      if (req.query.goalType) {
        filter.goalType = req.query.goalType;
      }

      const goals = await WellnessGoal.find(filter).sort({ date: -1 }).limit(50);
      res.json(goals);
    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── POST /api/patient/goals ────────────────────────────────────────
router.post(
  '/goals',
  [
    body('goalType').isIn(['steps', 'water', 'sleep']).withMessage('Goal type must be steps, water, or sleep'),
    body('target').isNumeric().withMessage('Target must be a number'),
    body('value').isNumeric().withMessage('Value must be a number'),
    body('date').isISO8601().withMessage('Valid date required'),
  ],
  auditLogger('CREATE_GOAL', 'wellness_goal'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { goalType, target, value, date } = req.body;
      const met = value >= target;

      const goal = await WellnessGoal.create({
        userId: req.user.userId,
        goalType,
        target,
        value,
        date: new Date(date),
        met,
      });

      res.status(201).json(goal);
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/patient/goals/progress ────────────────────────────────
router.get(
  '/goals/progress',
  auditLogger('VIEW_PROGRESS', 'wellness_goal'),
  async (req, res) => {
    try {
      // Get goals for the last 7 days
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const goals = await WellnessGoal.find({
        userId: req.user.userId,
        date: { $gte: weekAgo, $lte: today },
      });

      const progress = {};
      for (const type of ['steps', 'water', 'sleep']) {
        const typeGoals = goals.filter((g) => g.goalType === type);
        progress[type] = {
          met: typeGoals.filter((g) => g.met).length,
          total: typeGoals.length,
          latestValue: typeGoals.length > 0 ? typeGoals[typeGoals.length - 1].value : 0,
          latestTarget: typeGoals.length > 0 ? typeGoals[typeGoals.length - 1].target : 0,
        };
      }

      res.json(progress);
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/patient/reminders ─────────────────────────────────────
router.get(
  '/reminders',
  auditLogger('VIEW_REMINDERS', 'reminder'),
  async (req, res) => {
    try {
      const reminders = await Reminder.find({ userId: req.user.userId })
        .sort({ dueDate: 1 });
      res.json(reminders);
    } catch (error) {
      console.error('Get reminders error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── POST /api/patient/reminders ────────────────────────────────────
router.post(
  '/reminders',
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('dueDate').isISO8601().withMessage('Valid due date required'),
  ],
  auditLogger('CREATE_REMINDER', 'reminder'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, dueDate } = req.body;
      const reminder = await Reminder.create({
        userId: req.user.userId,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
      });

      res.status(201).json(reminder);
    } catch (error) {
      console.error('Create reminder error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── PUT /api/patient/reminders/:id ─────────────────────────────────
router.put(
  '/reminders/:id',
  auditLogger('UPDATE_REMINDER', 'reminder'),
  async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { completed: req.body.completed },
        { new: true }
      );

      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found.' });
      }

      res.json(reminder);
    } catch (error) {
      console.error('Update reminder error:', error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ─── GET /api/patient/health-tip ────────────────────────────────────
router.get('/health-tip', async (req, res) => {
  // Deterministic tip based on day-of-year so same tip shows all day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const tip = healthTips[dayOfYear % healthTips.length];
  res.json(tip);
});

module.exports = router;
