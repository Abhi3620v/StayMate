/**
 * Startup Environment Variables Validator Gate
 * Ensures all required production variables exist before boot.
 */
export const validateEnv = () => {
  // Support both MONGO_URI and MONGODB_URI keys
  if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URI;
  }

  const requiredVariables = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'CLIENT_URL',
    'SERVER_URL',
    'COOKIE_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CLOUDINARY_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_SECRET',
  ];

  const missing = [];

  requiredVariables.forEach((variable) => {
    if (!process.env[variable] || process.env[variable].trim() === '') {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    console.error('\n======================================================');
    console.error('❌ [FATAL] STARTUP ENVIRONMENT ERROR');
    console.error('The application failed to start due to missing environment keys:');
    missing.forEach((item) => console.error(`  - ${item}`));
    console.error('Configure these keys inside your backend/.env configuration file.');
    console.error('======================================================\n');
    process.exit(1);
  }
};

export default validateEnv;
