import { UAParser } from 'ua-parser-js';
import AuditLog from '../models/AuditLog.js';
import { isDbConnected } from '../config/inMemoryDb.js';

// In-Memory mock logs fallback if offline
export const mockAuditLogs = [];

/**
 * Dispatches an audit log trail row
 *
 * @param {Object} params - Logging specifications
 * @param {string} params.userId - User ID associated with event
 * @param {string} params.action - Event code (e.g. AUTH_LOGIN, PROFILE_UPDATE)
 * @param {string} [params.status='success'] - 'success' or 'failure'
 * @param {Object} [params.details] - Miscellaneous key/value event parameters
 * @param {Object} [params.req] - Express request payload to decode user-agent/IP info
 */
export const logAction = async ({ userId, action, status = 'success', details = null, req = null }) => {
  let browser = 'Unknown Browser';
  let device = 'Unknown Device';
  let ip = 'Unknown IP';

  if (req) {
    // 1. Extract client telemetry from request headers
    const userAgentString = req.headers['user-agent'];
    if (userAgentString) {
      const parser = new UAParser(userAgentString);
      const result = parser.getResult();
      browser = `${result.browser.name || 'Unknown Browser'} ${result.browser.version || ''}`.trim();
      device = `${result.os.name || 'Unknown OS'} - ${result.device.vendor || ''} ${result.device.model || ''}`.replace(/\s+/g, ' ').trim();
    }

    // 2. Extract client IP address
    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown IP';
    if (ip.includes('::ffff:')) {
      ip = ip.split('::ffff:')[1];
    }
  }

  const logPayload = {
    userId: userId || null,
    action,
    timestamp: new Date(),
    device,
    browser,
    ip,
    status,
    details,
  };

  try {
    if (isDbConnected()) {
      await AuditLog.create(logPayload);
    } else {
      mockAuditLogs.push(logPayload);
      console.log(`📡 [Mock Audit Log Recorded] Action: ${action} | User: ${userId || 'Guest'} | IP: ${ip}`);
    }
  } catch (error) {
    console.error(`⚠️ [Audit Logger Failed] error: ${error.message}`);
  }
};

export default logAction;
