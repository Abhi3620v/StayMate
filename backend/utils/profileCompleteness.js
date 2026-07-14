/**
 * Profile Completeness Evaluator
 * Computes profile progress statistics, missing attributes, and call-to-actions.
 */
export const calculateCompleteness = (user) => {
  const criteria = [
    { key: 'avatar', label: 'Upload Profile Picture', check: (u) => !!(u.avatar && u.avatar.trim() !== '') },
    { key: 'name', label: 'Provide Full Name', check: (u) => !!(u.name && u.name.trim() !== '') },
    { key: 'username', label: 'Choose Username Handle', check: (u) => !!(u.username && u.username.trim() !== '') },
    { key: 'phone', label: 'Provide Phone Number', check: (u) => !!(u.phone && u.phone.trim() !== '') },
    { key: 'bio', label: 'Write Bio Description', check: (u) => !!(u.bio && u.bio.trim() !== '') },
    { key: 'emailVerified', label: 'Verify Email Address', check: (u) => u.status !== 'email_verification_pending' },
    { key: 'language', label: 'Select Platform Language', check: (u) => !!(u.preferences?.language && u.preferences.language.trim() !== '') },
    { key: 'notifications', label: 'Configure Email Notifications', check: (u) => !!(u.preferences?.theme && u.preferences.theme.trim() !== '') },
  ];

  const missingInformation = [];
  let completedCount = 0;

  criteria.forEach((item) => {
    if (item.check(user)) {
      completedCount += 1;
    } else {
      missingInformation.push({ field: item.key, label: item.label });
    }
  });

  const percentage = Math.round((completedCount / criteria.length) * 100);
  const suggestedNextAction = missingInformation.length > 0 ? missingInformation[0].label : 'Profile Complete!';

  return {
    percentage,
    missingInformation,
    suggestedNextAction,
  };
};

export default calculateCompleteness;
