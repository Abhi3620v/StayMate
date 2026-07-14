import React from 'react';
import Badge from '@/components/ui/Badge';
import { Cigarette, Wine, Dog, Utensils, Moon, Home, Users } from 'lucide-react';

export const LifestyleTags = ({ lifestyle = {} }) => {
  const tags = [];

  // 1. Smoking
  if (lifestyle.smoking !== undefined) {
    tags.push({
      label: lifestyle.smoking ? 'Smoker' : 'Non-Smoker',
      icon: Cigarette,
      variant: lifestyle.smoking ? 'error' : 'success',
    });
  }

  // 2. Drinking
  if (lifestyle.drinking !== undefined) {
    tags.push({
      label: lifestyle.drinking ? 'Drinks alcohol' : 'No alcohol',
      icon: Wine,
      variant: lifestyle.drinking ? 'warning' : 'secondary',
    });
  }

  // 3. Pets
  if (lifestyle.pets !== undefined) {
    tags.push({
      label: lifestyle.pets ? 'Pets Allowed' : 'No Pets',
      icon: Dog,
      variant: lifestyle.pets ? 'primary' : 'secondary',
    });
  }

  // 4. Food preference
  if (lifestyle.foodPreference) {
    const foodLabels = {
      veg: 'Vegetarian',
      'non-veg': 'Non-Vegetarian',
      any: 'No food preference',
    };
    tags.push({
      label: foodLabels[lifestyle.foodPreference] || lifestyle.foodPreference,
      icon: Utensils,
      variant: lifestyle.foodPreference === 'veg' ? 'success' : 'primary',
    });
  }

  // 5. Sleep Schedule
  if (lifestyle.sleepingSchedule) {
    const sleepLabels = {
      early_bird: 'Early Bird',
      night_owl: 'Night Owl',
      flexible: 'Flexible Schedule',
    };
    tags.push({
      label: sleepLabels[lifestyle.sleepingSchedule] || lifestyle.sleepingSchedule,
      icon: Moon,
      variant: 'primary',
    });
  }

  // 6. Guests
  if (lifestyle.guests !== undefined) {
    tags.push({
      label: lifestyle.guests ? 'Guests Allowed' : 'No Guests',
      icon: Users,
      variant: lifestyle.guests ? 'primary' : 'secondary',
    });
  }

  // 7. WFH
  if (lifestyle.workFromHome !== undefined) {
    tags.push({
      label: lifestyle.workFromHome ? 'Works WFH' : 'Office/On-site',
      icon: Home,
      variant: 'secondary',
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => {
        const Icon = tag.icon;
        return (
          <Badge
            key={idx}
            variant={tag.variant}
            className="flex items-center space-x-1.5 px-3 py-1 text-[11px] font-bold rounded-full select-none"
          >
            <Icon className="h-3 w-3" />
            <span>{tag.label}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default LifestyleTags;
