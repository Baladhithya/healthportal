const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Log after the response is sent
    res.on('finish', async () => {
      if (req.user && res.statusCode < 400) {
        try {
          await AuditLog.create({
            userId: req.user.userId,
            action,
            resource,
            ipAddress: req.ip || req.connection.remoteAddress,
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
    });
    next();
  };
};

module.exports = auditLogger;
