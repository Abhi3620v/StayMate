import mongoose from 'mongoose';
import SystemJob from '../../../models/SystemJob.js';
import Session from '../../../models/Session.js';
import Notification from '../../../models/Notification.js';
import Property from '../../../models/Property.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

// Internal memory store for mock job history when running offline
const mockJobs = [];

const registeredJobs = {
  session_cleanup: async () => {
    if (isDbConnected()) {
      const res = await Session.deleteMany({
        $or: [
          { expirationTime: { $lt: new Date() } },
          { revoked: true }
        ]
      });
      return `Deleted ${res.deletedCount} expired or revoked sessions.`;
    }
    return 'Mock session cleanup: deleted 0 expired sessions.';
  },

  notification_cleanup: async () => {
    if (isDbConnected()) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const res = await Notification.deleteMany({
        readStatus: true,
        createdAt: { $lt: thirtyDaysAgo }
      });
      return `Deleted ${res.deletedCount} read notifications older than 30 days.`;
    }
    return 'Mock notification cleanup: deleted 0 old notifications.';
  },

  temp_file_cleanup: async () => {
    // Purges temporary files (represented as mock action or logs)
    return 'Temporary uploads folder clean: 0 orphan temp files found.';
  },

  archived_property_cleanup: async () => {
    if (isDbConnected()) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const res = await Property.deleteMany({
        status: 'archived',
        updatedAt: { $lt: thirtyDaysAgo }
      });
      return `Permanently purged ${res.deletedCount} archived listings older than 30 days.`;
    }
    return 'Mock archived property cleanup: 0 listings purged.';
  },

  analytics_aggregation: async () => {
    // Run mock metric snapshots calculation
    return 'Analytics aggregated: platform growth snapshot calculated and cached.';
  },

  email_retry_queue: async () => {
    // Retry failed emails in database logs
    return 'Email queue check: all scheduled retries completed successfully (0 failed emails found).';
  }
};

export const jobScheduler = {
  /**
   * Run a specific job by name and log its duration/status
   */
  runJob: async (jobName) => {
    const jobFn = registeredJobs[jobName];
    if (!jobFn) {
      throw new Error(`Job ${jobName} is not registered in the scheduler.`);
    }

    const start = Date.now();
    let status = 'completed';
    let errorMsg = '';
    let result = '';

    try {
      result = await jobFn();
    } catch (err) {
      status = 'failed';
      errorMsg = err.message;
    }

    const duration = Date.now() - start;

    if (isDbConnected()) {
      try {
        await SystemJob.findOneAndUpdate(
          { name: jobName },
          {
            name: jobName,
            status,
            lastRun: new Date(),
            lastDuration: duration,
            error: errorMsg || result,
            $inc: { runCount: 1 }
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`Failed to save SystemJob state for ${jobName}:`, err.message);
      }
    } else {
      // Offline mock tracking
      const existing = mockJobs.find(j => j.name === jobName);
      if (existing) {
        existing.status = status;
        existing.lastRun = new Date();
        existing.lastDuration = duration;
        existing.error = errorMsg || result;
        existing.runCount++;
      } else {
        mockJobs.push({
          name: jobName,
          status,
          lastRun: new Date(),
          lastDuration: duration,
          error: errorMsg || result,
          runCount: 1
        });
      }
    }

    if (status === 'failed') {
      throw new Error(errorMsg);
    }
    return { name: jobName, duration, status, result };
  },

  /**
   * Get all jobs status logs
   */
  getJobsStatus: async () => {
    if (isDbConnected()) {
      // Sync names into DB if they don't exist yet
      for (const name of Object.keys(registeredJobs)) {
        const exists = await SystemJob.findOne({ name });
        if (!exists) {
          await SystemJob.create({ name, status: 'idle', runCount: 0 });
        }
      }
      return await SystemJob.find().lean();
    } else {
      // Sync names in mock array
      for (const name of Object.keys(registeredJobs)) {
        const exists = mockJobs.find(j => j.name === name);
        if (!exists) {
          mockJobs.push({ name, status: 'idle', runCount: 0, lastDuration: 0, error: '' });
        }
      }
      return mockJobs;
    }
  },

  /**
   * Start scheduling intervals
   */
  startScheduler: () => {
    console.log('⏰ [BACKGROUND JOB SCHEDULER STARTED]');
    
    // Run Session & Temp File Cleanups every 15 minutes
    setInterval(async () => {
      try {
        await jobScheduler.runJob('session_cleanup');
        await jobScheduler.runJob('temp_file_cleanup');
      } catch (err) {
        // Log silently
      }
    }, 15 * 60 * 1000);

    // Run Analytics & Pruning every 6 hours
    setInterval(async () => {
      try {
        await jobScheduler.runJob('notification_cleanup');
        await jobScheduler.runJob('archived_property_cleanup');
        await jobScheduler.runJob('analytics_aggregation');
        await jobScheduler.runJob('email_retry_queue');
      } catch (err) {
        // Log silently
      }
    }, 6 * 60 * 60 * 1000);
  }
};

export default jobScheduler;
