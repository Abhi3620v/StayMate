import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import { useRoommate } from '@/context/RoommateContext';
import { User, Sparkles, Home, ListPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfileEditModal = ({ isOpen, onClose }) => {
  const { profile, createMyProfile, updateMyProfile } = useRoommate();
  const [activeTab, setActiveTab] = useState('basic');

  // Form State
  const [formData, setFormData] = useState({
    basicInfo: {
      occupation: 'student',
      collegeOrCompany: '',
      age: 18,
      gender: 'male',
      bio: '',
    },
    lifestyle: {
      sleepingSchedule: 'flexible',
      wakeUpTime: '08:00 AM',
      foodPreference: 'any',
      smoking: false,
      drinking: false,
      pets: false,
      guests: false,
      cleanliness: 'moderate',
      noisePreference: 'moderate',
      studyEnvironment: 'flexible',
      workFromHome: false,
      socialLifestyle: 'moderate',
    },
    budget: {
      monthlyRent: 5000,
      securityDeposit: 10000,
      propertyType: 'any',
      listingType: 'any',
    },
    locationPreferences: {
      city: '',
      area: '',
      maxDistance: 10,
    },
    languagesSpoken: [],
    hobbies: [],
    interests: [],
    moveInDate: '',
    maxRoommates: 1,
    visibility: 'public',
    profilePicture: '',
  });

  // Load existing profile if any
  useEffect(() => {
    if (profile) {
      const formattedDate = profile.moveInDate
        ? new Date(profile.moveInDate).toISOString().split('T')[0]
        : '';

      setFormData({
        basicInfo: {
          occupation: profile.basicInfo?.occupation || 'student',
          collegeOrCompany: profile.basicInfo?.collegeOrCompany || '',
          age: profile.basicInfo?.age || 18,
          gender: profile.basicInfo?.gender || 'male',
          bio: profile.basicInfo?.bio || '',
        },
        lifestyle: {
          sleepingSchedule: profile.lifestyle?.sleepingSchedule || 'flexible',
          wakeUpTime: profile.lifestyle?.wakeUpTime || '08:00 AM',
          foodPreference: profile.lifestyle?.foodPreference || 'any',
          smoking: !!profile.lifestyle?.smoking,
          drinking: !!profile.lifestyle?.drinking,
          pets: !!profile.lifestyle?.pets,
          guests: !!profile.lifestyle?.guests,
          cleanliness: profile.lifestyle?.cleanliness || 'moderate',
          noisePreference: profile.lifestyle?.noisePreference || 'moderate',
          studyEnvironment: profile.lifestyle?.studyEnvironment || 'flexible',
          workFromHome: !!profile.lifestyle?.workFromHome,
          socialLifestyle: profile.lifestyle?.socialLifestyle || 'moderate',
        },
        budget: {
          monthlyRent: profile.budget?.monthlyRent || 5000,
          securityDeposit: profile.budget?.securityDeposit || 10000,
          propertyType: profile.budget?.propertyType || 'any',
          listingType: profile.budget?.listingType || 'any',
        },
        locationPreferences: {
          city: profile.locationPreferences?.city || '',
          area: profile.locationPreferences?.area || '',
          maxDistance: profile.locationPreferences?.maxDistance || 10,
        },
        languagesSpoken: profile.languagesSpoken || [],
        hobbies: profile.hobbies || [],
        interests: profile.interests || [],
        moveInDate: formattedDate,
        maxRoommates: profile.maxRoommates || 1,
        visibility: profile.visibility || 'public',
        profilePicture: profile.profilePicture || '',
      });
    }
  }, [profile, isOpen]);

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayInput = (field, textValue) => {
    const list = textValue
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
    setFormData((prev) => ({
      ...prev,
      [field]: list,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.basicInfo.collegeOrCompany.trim()) {
      toast.error('Please specify your College/Company.');
      return;
    }
    if (!formData.basicInfo.bio.trim() || formData.basicInfo.bio.length < 10) {
      toast.error('Please provide a bio of at least 10 characters.');
      return;
    }
    if (!formData.locationPreferences.city.trim()) {
      toast.error('Preferred City is required.');
      return;
    }
    if (!formData.locationPreferences.area.trim()) {
      toast.error('Preferred Area is required.');
      return;
    }
    if (formData.languagesSpoken.length === 0) {
      toast.error('Please specify at least one language.');
      return;
    }
    if (!formData.moveInDate) {
      toast.error('Please select a move-in date.');
      return;
    }

    try {
      if (profile) {
        await updateMyProfile(formData);
      } else {
        await createMyProfile(formData);
      }
      onClose();
    } catch (err) {
      // toast shows in context
    }
  };

  const tabItem = (id, label, Icon) => (
    <button
      key={id}
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 pb-3 text-xs font-bold border-b-2 transition-all select-none ${
        activeTab === id
          ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
          : 'border-transparent text-secondary-400 hover:text-secondary-600'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={profile ? 'Edit Roommate Profile' : 'Setup Roommate Profile'} size="lg">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Step Tabs Navigation */}
        <div className="flex items-center space-x-4 border-b border-secondary-100 dark:border-secondary-800 scrollbar-none overflow-x-auto shrink-0">
          {tabItem('basic', 'Basic Info', User)}
          {tabItem('lifestyle', 'Lifestyle Preferences', Sparkles)}
          {tabItem('budget', 'Budget & Location', Home)}
          {tabItem('extras', 'Extras & Tags', ListPlus)}
        </div>

        {/* Tab contents */}
        <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Occupation Status</label>
                  <Select
                    value={formData.basicInfo.occupation}
                    onChange={(e) => handleNestedChange('basicInfo', 'occupation', e.target.value)}
                    options={[
                      { label: 'Student', value: 'student' },
                      { label: 'Working Professional', value: 'professional' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">College / Company Name</label>
                  <Input
                    placeholder="e.g. Amity University, TCS"
                    value={formData.basicInfo.collegeOrCompany}
                    onChange={(e) => handleNestedChange('basicInfo', 'collegeOrCompany', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Age</label>
                  <Input
                    type="number"
                    value={formData.basicInfo.age}
                    onChange={(e) => handleNestedChange('basicInfo', 'age', Number(e.target.value))}
                    min="18"
                    max="100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Gender</label>
                  <Select
                    value={formData.basicInfo.gender}
                    onChange={(e) => handleNestedChange('basicInfo', 'gender', e.target.value)}
                    options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Other', value: 'other' },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Profile Photo URL (Optional)</label>
                <Input
                  placeholder="Paste direct image link or leave blank to use general avatar"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData((prev) => ({ ...prev, profilePicture: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Bio Description</label>
                <Textarea
                  placeholder="Introduce yourself, hobbies, work schedule, and what you look for in a roommate..."
                  rows="3"
                  value={formData.basicInfo.bio}
                  onChange={(e) => handleNestedChange('basicInfo', 'bio', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Profile Visibility</label>
                  <Select
                    value={formData.visibility}
                    onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value }))}
                    options={[
                      { label: 'Public (Everyone)', value: 'public' },
                      { label: 'Only Logged-in Users', value: 'only_logged_in' },
                      { label: 'Private (Hidden)', value: 'private' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Max Roommates Preferred</label>
                  <Input
                    type="number"
                    value={formData.maxRoommates}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxRoommates: Number(e.target.value) }))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIFESTYLE PREFERENCES */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Sleeping Schedule</label>
                  <Select
                    value={formData.lifestyle.sleepingSchedule}
                    onChange={(e) => handleNestedChange('lifestyle', 'sleepingSchedule', e.target.value)}
                    options={[
                      { label: 'Early Bird', value: 'early_bird' },
                      { label: 'Night Owl', value: 'night_owl' },
                      { label: 'Flexible', value: 'flexible' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Wake Up Time</label>
                  <Input
                    placeholder="e.g. 7:00 AM, 10:00 AM"
                    value={formData.lifestyle.wakeUpTime}
                    onChange={(e) => handleNestedChange('lifestyle', 'wakeUpTime', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Food Preference</label>
                  <Select
                    value={formData.lifestyle.foodPreference}
                    onChange={(e) => handleNestedChange('lifestyle', 'foodPreference', e.target.value)}
                    options={[
                      { label: 'Vegetarian', value: 'veg' },
                      { label: 'Non-Vegetarian', value: 'non-veg' },
                      { label: 'No Preference', value: 'any' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Cleanliness Level</label>
                  <Select
                    value={formData.lifestyle.cleanliness}
                    onChange={(e) => handleNestedChange('lifestyle', 'cleanliness', e.target.value)}
                    options={[
                      { label: 'High (Spotless)', value: 'high' },
                      { label: 'Moderate (Tidy)', value: 'moderate' },
                      { label: 'Low (Relaxed)', value: 'low' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Noise Preference</label>
                  <Select
                    value={formData.lifestyle.noisePreference}
                    onChange={(e) => handleNestedChange('lifestyle', 'noisePreference', e.target.value)}
                    options={[
                      { label: 'Quiet (Silent Study)', value: 'quiet' },
                      { label: 'Moderate (Music on headphones)', value: 'moderate' },
                      { label: 'Loud (Chill with speakers)', value: 'loud' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Social Lifestyle</label>
                  <Select
                    value={formData.lifestyle.socialLifestyle}
                    onChange={(e) => handleNestedChange('lifestyle', 'socialLifestyle', e.target.value)}
                    options={[
                      { label: 'Introvert (Quiet night in)', value: 'introvert' },
                      { label: 'Extrovert (Hosting parties)', value: 'extrovert' },
                      { label: 'Moderate (Balanced)', value: 'moderate' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Study/Work Environment</label>
                  <Select
                    value={formData.lifestyle.studyEnvironment}
                    onChange={(e) => handleNestedChange('lifestyle', 'studyEnvironment', e.target.value)}
                    options={[
                      { label: 'Quiet Room', value: 'quiet' },
                      { label: 'Group study / Interactive room', value: 'group' },
                      { label: 'Flexible', value: 'flexible' },
                    ]}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-secondary-100 dark:border-secondary-800/80">
                <Checkbox
                  id="lf-smoking"
                  label="I smoke"
                  checked={formData.lifestyle.smoking}
                  onChange={(e) => handleNestedChange('lifestyle', 'smoking', e.target.checked)}
                />
                <Checkbox
                  id="lf-drinking"
                  label="I drink alcohol"
                  checked={formData.lifestyle.drinking}
                  onChange={(e) => handleNestedChange('lifestyle', 'drinking', e.target.checked)}
                />
                <Checkbox
                  id="lf-pets"
                  label="Pets allowed"
                  checked={formData.lifestyle.pets}
                  onChange={(e) => handleNestedChange('lifestyle', 'pets', e.target.checked)}
                />
                <Checkbox
                  id="lf-guests"
                  label="Guests welcome"
                  checked={formData.lifestyle.guests}
                  onChange={(e) => handleNestedChange('lifestyle', 'guests', e.target.checked)}
                />
                <Checkbox
                  id="lf-wfh"
                  label="Work from home"
                  checked={formData.lifestyle.workFromHome}
                  onChange={(e) => handleNestedChange('lifestyle', 'workFromHome', e.target.checked)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: BUDGET & LOCATION */}
          {activeTab === 'budget' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Monthly Rent Budget (INR)</label>
                  <Input
                    type="number"
                    value={formData.budget.monthlyRent}
                    onChange={(e) => handleNestedChange('budget', 'monthlyRent', Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Preferred Security Deposit</label>
                  <Input
                    type="number"
                    value={formData.budget.securityDeposit}
                    onChange={(e) => handleNestedChange('budget', 'securityDeposit', Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Preferred Property Type</label>
                  <Select
                    value={formData.budget.propertyType}
                    onChange={(e) => handleNestedChange('budget', 'propertyType', e.target.value)}
                    options={[
                      { label: 'Any Property Type', value: 'any' },
                      { label: 'Apartment', value: 'apartment' },
                      { label: 'Flat', value: 'flat' },
                      { label: 'PG / Shared Accommodation', value: 'pg' },
                      { label: 'Studio Room', value: 'studio' },
                      { label: 'Independent House', value: 'independent_house' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Preferred Listing Type</label>
                  <Select
                    value={formData.budget.listingType}
                    onChange={(e) => handleNestedChange('budget', 'listingType', e.target.value)}
                    options={[
                      { label: 'Any Listing Type', value: 'any' },
                      { label: 'Rent', value: 'rent' },
                      { label: 'Lease', value: 'lease' },
                      { label: 'Shared Flatshare', value: 'shared' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Preferred City</label>
                  <Input
                    placeholder="e.g. Noida, Delhi"
                    value={formData.locationPreferences.city}
                    onChange={(e) => handleNestedChange('locationPreferences', 'city', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Preferred Area</label>
                  <Input
                    placeholder="e.g. Sector 62, Connaught Place"
                    value={formData.locationPreferences.area}
                    onChange={(e) => handleNestedChange('locationPreferences', 'area', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Max Distance Allowed (km)</label>
                  <Input
                    type="number"
                    value={formData.locationPreferences.maxDistance}
                    onChange={(e) => handleNestedChange('locationPreferences', 'maxDistance', Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Preferred Move-in Date</label>
                  <Input
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, moveInDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXTRAS & TAGS */}
          {activeTab === 'extras' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Languages Spoken (comma separated)</label>
                <Input
                  placeholder="e.g. English, Hindi, Punjabi"
                  value={formData.languagesSpoken.join(', ')}
                  onChange={(e) => handleArrayInput('languagesSpoken', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Hobbies (comma separated)</label>
                <Input
                  placeholder="e.g. Reading, Coding, Travel, Football"
                  value={formData.hobbies.join(', ')}
                  onChange={(e) => handleArrayInput('hobbies', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-secondary-500 uppercase tracking-wide">Interests (comma separated)</label>
                <Input
                  placeholder="e.g. Tech, AI, Gaming, Music, Photography"
                  value={formData.interests.join(', ')}
                  onChange={(e) => handleArrayInput('interests', e.target.value)}
                />
              </div>

              {/* Tips */}
              <div className="p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-2xl text-[11px] text-primary-700 dark:text-primary-300 leading-relaxed font-semibold">
                💡 **Pro Tip**: Including popular tags like 'Gaming', 'Gym', or 'Veg food' helps the compatibility algorithm surface other profiles who share your passions!
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-secondary-100 dark:border-secondary-800 shrink-0">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          {activeTab === 'basic' && (
            <Button variant="primary" size="sm" type="button" onClick={() => setActiveTab('lifestyle')}>
              Next: Lifestyle
            </Button>
          )}
          {activeTab === 'lifestyle' && (
            <Button variant="primary" size="sm" type="button" onClick={() => setActiveTab('budget')}>
              Next: Budget
            </Button>
          )}
          {activeTab === 'budget' && (
            <Button variant="primary" size="sm" type="button" onClick={() => setActiveTab('extras')}>
              Next: Extras
            </Button>
          )}
          {activeTab === 'extras' && (
            <Button variant="primary" size="sm" type="submit">
              {profile ? 'Save Profile' : 'Complete Profile'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;
