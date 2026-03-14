const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

const router = express.Router();

// ─── Helper: generate tokens ────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

// ─── POST /api/auth/register ────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('hospitalName').optional({ checkFalsy: true }).trim(),
    body('role').isIn(['patient', 'provider']).withMessage('Role must be patient or provider'),
    body('consentGiven').isBoolean().withMessage('Consent field required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, role, consentGiven, dateOfBirth, hospitalName } = req.body;

      if (!consentGiven) {
        return res.status(400).json({ error: 'You must consent to data collection to register.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered.' });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      let licenseKey;
      if (role === 'provider') {
        const crypto = require('crypto');
        licenseKey = 'LIC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      }

      const user = await User.create({
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        consentGiven,
        hospitalName: role === 'provider' ? hospitalName : undefined,
        licenseKey,
      });

      // Auto-create empty patient profile for patient role
      if (role === 'patient') {
        await PatientProfile.create({ userId: user._id });
      }

      // Audit log
      await AuditLog.create({
        userId: user._id,
        action: 'REGISTER',
        resource: 'user',
        ipAddress: req.ip,
      });

      res.status(201).json({
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error during registration.' });
    }
  }
);

// ─── POST /api/auth/login ───────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Audit failed login
        await AuditLog.create({
          userId: new (require('mongoose').Types.ObjectId)(),
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ipAddress: req.ip,
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        await AuditLog.create({
          userId: user._id,
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ipAddress: req.ip,
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Backfill missing license keys for older providers
      if (user.role === 'provider' && !user.licenseKey) {
        const crypto = require('crypto');
        user.licenseKey = 'LIC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        await user.save();
      }

      if (user.isTwoFactorEnabled) {
        return res.json({
          requires2FA: true,
          userId: user._id
        });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await AuditLog.create({
        userId: user._id,
        action: 'LOGIN',
        resource: 'auth',
        ipAddress: req.ip,
      });

      res.json({
        accessToken,
        refreshToken,
        role: user.role,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          licenseKey: user.licenseKey,
          hospitalName: user.hospitalName,
          mobileNumber: user.mobileNumber,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login.' });
    }
  }
);

// ─── POST /api/auth/2fa/enable ──────────────────────────────────────
router.post('/2fa/enable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `HealthPortal (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ secret: secret.base32, qrCodeUrl });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/2fa/verify ──────────────────────────────────────
router.post('/2fa/verify', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ error: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/2fa/validate ────────────────────────────────────
router.post('/2fa/validate', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(400).json({ error: '2FA not enabled for user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 step before/after
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await AuditLog.create({
      userId: user._id,
      action: 'LOGIN',
      resource: 'auth',
      ipAddress: req.ip,
    });

    res.json({
      accessToken,
      refreshToken,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        licenseKey: user.licenseKey,
        hospitalName: user.hospitalName,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error('2FA validate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/refresh ─────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Backfill missing license keys for older providers
    if (user.role === 'provider' && !user.licenseKey) {
      const crypto = require('crypto');
      user.licenseKey = 'LIC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      await user.save();
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      licenseKey: user.licenseKey,
      hospitalName: user.hospitalName,
      mobileNumber: user.mobileNumber,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
