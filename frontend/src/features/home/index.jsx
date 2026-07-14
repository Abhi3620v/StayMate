import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import PropertyCard from '@/features/property/components/PropertyCard';
import RoommateCard from '@/features/roommate/components/RoommateCard';
import propertyService from '@/services/propertyService';
import roommateService from '@/services/roommateService';
import { 
  Compass, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Search, 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Wifi, 
  ArrowUpRight,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [learnMoreTopic, setLearnMoreTopic] = useState(null);
  const [stats, setStats] = useState({
    verifiedStays: 20000,
    activeRoommates: 5000,
    cities: 120,
    matchSuccess: 98
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      // 1. Fetch properties listing count
      try {
        const propsRes = await propertyService.getProperties({ limit: 1 });
        if (propsRes && propsRes.pagination) {
          const total = propsRes.pagination.total || 0;
          setStats(prev => ({ ...prev, verifiedStays: total }));
        }
      } catch (err) {
        console.warn('Failed to load real properties count:', err);
      }

      // 2. Fetch roommates profile count (Requires user login session, fallback for guest visitors)
      if (user) {
        try {
          const roommatesRes = await roommateService.discoverMatches({ limit: 1 });
          if (roommatesRes && roommatesRes.pagination) {
            const total = roommatesRes.pagination.totalItems || roommatesRes.pagination.total || 0;
            setStats(prev => ({ ...prev, activeRoommates: total }));
          }
        } catch (err) {
          console.warn('Failed to load real roommates count:', err);
        }
      } else {
        // Fallback placeholder count for guest visitors
        setStats(prev => ({ ...prev, activeRoommates: 4 }));
      }

      // 3. Fetch unique cities count
      try {
        const allProps = await propertyService.getProperties({ limit: 100 });
        if (allProps && allProps.properties) {
          const uniqueCities = new Set((allProps.properties || []).map(p => p.location?.city).filter(Boolean));
          setStats(prev => ({ ...prev, cities: uniqueCities.size }));
        }
      } catch (err) {
        console.warn('Failed to load real cities count:', err);
      }
    };
    
    fetchRealStats();
  }, [user]);
  
  const mockFeaturedProperties = [
    {
      id: 'prop-1',
      title: 'Premium Double Room (Near Delhi Univ)',
      price: 6500,
      type: 'room',
      address: 'North Campus, Delhi',
      rating: 4.9,
      reviewCount: 22,
      images: [{ url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80' }],
      isVerified: true,
      isOwnerVerified: true,
      compatibilityScore: 92,
      availableFrom: 'Immediately',
      amenities: ['Wifi', 'AC', 'Power Backup'],
    },
    {
      id: 'prop-2',
      title: 'Fully Furnished 2BHK flat',
      price: 12000,
      type: 'flat',
      address: 'Sector 15, Noida',
      rating: 4.7,
      reviewCount: 8,
      images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80' }],
      isVerified: true,
      isOwnerVerified: true,
      compatibilityScore: 85,
      availableFrom: '10th July',
      amenities: ['Modular Kitchen', 'Gym', 'Washing Machine'],
    },
    {
      id: 'prop-3',
      title: 'Cozy PG with Meals included',
      price: 8000,
      type: 'pg',
      address: 'Katraj, Pune',
      rating: 4.5,
      reviewCount: 14,
      images: [{ url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=500&q=80' }],
      isVerified: true,
      isOwnerVerified: false,
      compatibilityScore: 78,
      availableFrom: 'Immediately',
      amenities: ['Food', 'Housekeeping', 'WiFi'],
    }
  ];

  const mockFeaturedRoommates = [
    {
      id: 'rm-1',
      user: {
        name: 'Neha Kapoor',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
      age: 22,
      gender: 'female',
      occupation: 'student',
      budget: 5000,
      foodPreference: 'veg',
      smoking: false,
      drinking: false,
      compatibilityScore: 94,
      languages: ['English', 'Hindi'],
      sleepSchedule: '10 PM - 6 AM',
      bio: 'Final year college student looking for a quiet, study-friendly female flatmate to share an apartment in Delhi.',
      isVerified: true,
    },
    {
      id: 'rm-2',
      user: {
        name: 'Vikram Malhotra',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      },
      age: 26,
      gender: 'male',
      occupation: 'professional',
      budget: 8000,
      foodPreference: 'any',
      smoking: false,
      drinking: true,
      compatibilityScore: 87,
      languages: ['English', 'Hindi', 'Punjabi'],
      sleepSchedule: '12 AM - 8 AM',
      bio: 'Software engineer moving to Noida for a new job. Clean, respectful, and looks for an awesome roommate.',
      isVerified: true,
    }
  ];

  const popularCities = [
    { name: 'Bangalore', count: 1240, rent: 14000, img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Delhi', count: 982, rent: 8500, img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Mumbai', count: 1430, rent: 18000, img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=300&q=80' },
    { name: 'Pune', count: 620, rent: 9000, img: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=300&q=80' },
    { name: 'Hyderabad', count: 810, rent: 11000, img: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=300&q=80' },
    { name: 'Chennai', count: 480, rent: 9500, img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80' }
  ];

  const testimonials = [
    {
      name: 'Pooja Iyer',
      role: 'Student at DU',
      comment: 'StayMate helped me find a verified double room and a roommate who shares my sleep and study preferences. The compatibility matching was spot on!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      location: 'New Delhi',
      rating: 5,
    },
    {
      name: 'Rohan Deshmukh',
      role: 'Software Architect',
      comment: 'Moving to Bangalore was stressful until I used StayMate. Found a premium flat and a flatmate who is WFH as well. Extremely seamless experience.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      location: 'Bangalore',
      rating: 5,
    }
  ];

  const faqs = [
    { q: 'How does roommate compatibility score matching work?', a: 'We evaluate roommate profiles across lifestyle parameters. Critical limits (genders, maximum budget boundaries) act as hard checks, while domestic habits (cooking schedule, WFH status, sleep schedules) are calculated dynamically to display compatibility from 0 to 100.' },
    { q: 'How are landlords and properties verified?', a: 'Every owner is required to submit government identity verification documents (KYC). Listings undergo physical coordinates verification, review gating, and administrative audits before acquiring the verified badge.' },
    { q: 'Can I request to schedule physical property viewings?', a: 'Yes. Once you find a listing, you can select viewing dates on the visit request form inside the property details sheet. The landlord receives the request immediately to approve or reject.' },
    { q: 'Is StayMate free for listings owners?', a: 'Listing properties and roommate profiles is currently 100% free under our launch promo, with future premium search boosting options planned.' }
  ];



  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-24 py-8 max-w-7xl mx-auto">
      
      {/* 1. Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-16 pt-8">
        
        {/* Left Side Info */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <Badge variant="primary" size="md" className="bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 font-extrabold px-4 py-1.5 border-none shadow-premium-sm">
            🚀 Flatmate Finder & verified stays
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-secondary-900 dark:text-white leading-[1.08]">
            Find Your Stay.<br />
            Find Your <span className="text-primary-600">Roommate.</span>
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 text-sm sm:text-base max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
            Your perfect stay and ideal roommate, simplified.
          </p>
          <div className="flex flex-row items-center justify-center lg:justify-start gap-3 pt-2 w-full">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/properties')}
              className="px-5 py-3 shadow-premium-md font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center justify-center"
              rightIcon={<ArrowRight className="h-4 w-4 stroke-[1.8]" />}
            >
              Explore Stays
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/roommates')}
              className="px-5 py-3 border-secondary-200 dark:border-secondary-800 font-bold text-xs sm:text-sm bg-white dark:bg-secondary-900 hover:shadow-premium-sm whitespace-nowrap shrink-0 flex items-center justify-center"
            >
              Match Roommates
            </Button>
          </div>
        </div>

        {/* Right Side: Premium Hero Image Frame with floating badges */}
        <div className="flex-1 relative max-w-xl w-full shrink-0 group select-none lg:pl-8">
          {/* Main Hero Card Image */}
          <div className="aspect-[4/3] rounded-[28px] overflow-hidden border border-secondary-200/50 dark:border-secondary-800 shadow-premium-lg bg-secondary-100 dark:bg-secondary-800 transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
              alt="Premium modern shared flat"
              className="h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-105"
            />
          </div>

          {/* Floating Badge 1: Rating */}
          <div className="absolute -top-4 left-10 z-10 flex items-center bg-white/95 dark:bg-secondary-900/95 backdrop-blur-md border border-secondary-200/50 dark:border-secondary-800 rounded-[14px] px-3.5 py-2.5 shadow-premium-lg animate-float-slow">
            <Star className="h-4.5 w-4.5 text-warning-500 fill-warning-500 mr-2 shrink-0 stroke-[1.8]" />
            <div>
              <p className="text-[9px] text-secondary-400 font-bold leading-none uppercase tracking-wider">Rating</p>
              <p className="text-xs font-extrabold text-secondary-800 dark:text-white mt-1">4.9 ( DU Area )</p>
            </div>
          </div>

          {/* Floating Badge 2: Verified */}
          <div className="absolute top-1/4 -right-4 z-10 flex items-center bg-success-600/95 backdrop-blur-md text-white border-none rounded-[14px] px-4 py-2.5 shadow-premium-lg animate-float-medium font-extrabold tracking-wide">
            <ShieldCheck className="h-4.5 w-4.5 mr-1.5 shrink-0 stroke-[1.8]" />
            <span className="text-[10px]">Verified Host</span>
          </div>

          {/* Floating Badge 3: Cost details */}
          <div className="absolute bottom-6 -left-2 z-10 flex items-center bg-white/95 dark:bg-secondary-900/95 backdrop-blur-md border border-secondary-200/50 dark:border-secondary-800 rounded-[14px] px-3.5 py-2.5 shadow-premium-lg animate-float-fast">
            <Wifi className="h-4.5 w-4.5 text-primary-500 mr-2 shrink-0 animate-pulse stroke-[1.8]" />
            <div>
              <p className="text-[9px] text-secondary-400 font-bold leading-none uppercase tracking-wider">Starting from</p>
              <p className="text-xs font-extrabold text-secondary-900 dark:text-white mt-1">₹8,500/mo</p>
            </div>
          </div>
        </div>
      </section>



      {/* 3. Trust Statistics */}
      <section className="py-8 bg-secondary-100/40 dark:bg-secondary-900/10 rounded-[20px] border border-secondary-200/50 dark:border-secondary-800/80 px-6 max-w-5xl mx-auto shadow-premium-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-secondary-200/60 dark:divide-secondary-800/60">
          <div className="space-y-1">
            <h4 className="text-3xl font-extrabold text-primary-600 tracking-tight">{stats.verifiedStays.toLocaleString()}+</h4>
            <p className="text-[10px] font-bold text-secondary-450 dark:text-secondary-500 uppercase tracking-widest mt-1">Verified Listings</p>
          </div>
          <div className="space-y-1 pt-4 md:pt-0">
            <h4 className="text-3xl font-extrabold text-primary-600 tracking-tight">{stats.activeRoommates.toLocaleString()}+</h4>
            <p className="text-[10px] font-bold text-secondary-450 dark:text-secondary-500 uppercase tracking-widest mt-1">Active Roommates</p>
          </div>
          <div className="space-y-1 pt-4 md:pt-0">
            <h4 className="text-3xl font-extrabold text-primary-600 tracking-tight">{stats.cities.toLocaleString()}+</h4>
            <p className="text-[10px] font-bold text-secondary-450 dark:text-secondary-500 uppercase tracking-widest mt-1">Cities Covered</p>
          </div>
          <div className="space-y-1 pt-4 md:pt-0">
            <h4 className="text-3xl font-extrabold text-primary-600 tracking-tight">{stats.matchSuccess}%</h4>
            <p className="text-[10px] font-bold text-secondary-450 dark:text-secondary-500 uppercase tracking-widest mt-1">Match Success</p>
          </div>
        </div>
      </section>

      {/* 4. Features/Benefits Overview */}
      <section className="space-y-12 text-center max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-secondary-900 dark:text-white leading-tight">Why StayMate?</h2>
          <p className="text-xs md:text-sm text-secondary-400 dark:text-secondary-500 font-medium">We solve the complete search and flatmate discovery lifecycle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverable className="p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 border border-secondary-200/50 dark:border-secondary-800/80">
            <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-900/40 shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">100% Verified Profiles</h4>
            <p className="text-xs text-secondary-550 dark:text-secondary-400 leading-relaxed max-w-xs font-medium">
              We check landlord identities and verify property coordinates to eliminate rental scams.
            </p>
            <button 
              onClick={() => setLearnMoreTopic('verified')} 
              className="text-xs font-bold text-primary-600 hover:text-primary-500 flex items-center justify-center group/btn focus:outline-none"
            >
              Learn More <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5 stroke-[1.8]" />
            </button>
          </Card>

          <Card hoverable className="p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 border border-secondary-200/50 dark:border-secondary-800/80">
            <div className="h-12 w-12 rounded-xl bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 flex items-center justify-center border border-success-100 dark:border-success-900/40 shrink-0">
              <Sparkles className="h-6 w-6 animate-pulse stroke-[1.8]" />
            </div>
            <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">Lifestyle Compatibility</h4>
            <p className="text-xs text-secondary-550 dark:text-secondary-400 leading-relaxed max-w-xs font-medium">
              Match compatibility scores based on sleep schedules, food habits, and domestic routines.
            </p>
            <button 
              onClick={() => setLearnMoreTopic('lifestyle')} 
              className="text-xs font-bold text-primary-600 hover:text-primary-500 flex items-center justify-center group/btn focus:outline-none"
            >
              Learn More <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5 stroke-[1.8]" />
            </button>
          </Card>

          <Card hoverable className="p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 border border-secondary-200/50 dark:border-secondary-800/80">
            <div className="h-12 w-12 rounded-xl bg-warning-50 dark:bg-warning-950/20 text-warning-600 dark:text-warning-400 flex items-center justify-center border border-warning-100 dark:border-warning-900/40 shrink-0">
              <Users className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">Instant Connection</h4>
            <p className="text-xs text-secondary-550 dark:text-secondary-400 leading-relaxed max-w-xs font-medium">
              Send visit request schedulers or chat in real-time utilizing secure built-in messaging channels.
            </p>
            <button 
              onClick={() => setLearnMoreTopic('connection')} 
              className="text-xs font-bold text-primary-600 hover:text-primary-500 flex items-center justify-center group/btn focus:outline-none"
            >
              Learn More <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5 stroke-[1.8]" />
            </button>
          </Card>
        </div>
      </section>

      {/* 5. Redesigned Featured Properties Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-secondary-900 dark:text-white leading-none">
              Featured Stays
            </h2>
            <p className="text-xs text-secondary-400 dark:text-secondary-550 mt-1 font-medium">Premium properties listed by verified landlords</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/properties')} className="border-secondary-200 dark:border-secondary-800 font-bold hover:shadow-premium-sm">
            View All Stays
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockFeaturedProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* 6. Signature Roommates Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-secondary-900 dark:text-white flex items-center leading-none">
              <Sparkles className="h-5 w-5 text-primary-500 mr-2 animate-pulse stroke-[1.8]" />
              Featured Roommates
            </h2>
            <p className="text-xs text-secondary-400 dark:text-secondary-550 mt-1 font-medium">Connect with flatmates matching your preferences</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/roommates')} className="border-secondary-200 dark:border-secondary-800 font-bold hover:shadow-premium-sm">
            Find Matches
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockFeaturedRoommates.map((rm) => (
            <RoommateCard key={rm.id} profile={rm} onMessageClick={(id) => toast.success(`Chat opened (ID: ${id})`)} />
          ))}
        </div>
      </section>

      {/* 7. Popular Cities */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-secondary-900 dark:text-white leading-none">
            Explore Popular Cities
          </h2>
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1 font-medium">Find rooms and roommates in top tech hubs and student capitals</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {popularCities.map((city) => (
            <Card
              key={city.name}
              onClick={() => navigate(`/properties?city=${city.name}`)}
              className="group relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-premium-sm hover:shadow-premium-lg cursor-pointer transition-all duration-normal border-secondary-200/50 dark:border-secondary-800"
            >
              <img
                src={city.img}
                alt={city.name}
                className="h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/80 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20 text-white space-y-0.5">
                <p className="font-extrabold text-sm flex items-center leading-none">
                  {city.name}
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-all stroke-[1.8]" />
                </p>
                <p className="text-[9px] font-bold opacity-85 mt-1 uppercase tracking-wider">{city.count} Stays</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. How It Works Section */}
      <section className="py-12 bg-secondary-100/30 dark:bg-secondary-900/10 rounded-[20px] border border-secondary-200/50 dark:border-secondary-800/80 p-8 max-w-4xl mx-auto space-y-10 shadow-premium-sm">
        <div className="text-center space-y-1">
          <h3 className="text-lg md:text-xl font-bold text-secondary-900 dark:text-white">How it works</h3>
          <p className="text-xs text-secondary-400 dark:text-secondary-500">Three simple steps to settle into your next flat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="h-10 w-10 rounded-full bg-primary-500 text-secondary-900 flex items-center justify-center font-black text-sm shadow-premium-sm">
              1
            </div>
            <h5 className="font-extrabold text-xs text-secondary-900 dark:text-white uppercase tracking-wider">Search Property</h5>
            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 max-w-[200px] leading-relaxed font-semibold">
              Explore verified properties near colleges or workplaces using custom filters.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="h-10 w-10 rounded-full bg-primary-500 text-secondary-900 flex items-center justify-center font-black text-sm shadow-premium-sm">
              2
            </div>
            <h5 className="font-extrabold text-xs text-secondary-900 dark:text-white uppercase tracking-wider">Connect & Chat</h5>
            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 max-w-[200px] leading-relaxed font-semibold">
              Review compatibility metrics and send instant inquiries to matched flatmates or hosts.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="h-10 w-10 rounded-full bg-primary-500 text-secondary-900 flex items-center justify-center font-black text-sm shadow-premium-sm">
              3
            </div>
            <h5 className="font-extrabold text-xs text-secondary-900 dark:text-white uppercase tracking-wider">Move In Cozy</h5>
            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 max-w-[200px] leading-relaxed font-semibold">
              Approve scheduling visits, inspect rooms, sign agreements, and move into your dream flat.
            </p>
          </div>

        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-secondary-900 dark:text-white leading-none">
            What Our Members Say
          </h2>
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1 font-medium">Read stories from verified tenants on StayMate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between border-secondary-200 rounded-[20px]">
              <div className="space-y-4">
                <div className="flex items-center space-x-0.5 text-warning-500 select-none">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current stroke-[1.8]" />
                  ))}
                </div>
                <p className="text-xs text-secondary-650 dark:text-secondary-300 leading-relaxed italic font-medium">
                  "{test.comment}"
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                <Avatar src={test.avatar} name={test.name} size="sm" className="border border-white/60 shadow-premium-sm" />
                <div>
                  <h6 className="text-xs font-extrabold text-secondary-900 dark:text-white leading-none">{test.name}</h6>
                  <p className="text-[9px] text-secondary-400 dark:text-secondary-500 font-extrabold mt-1.5 uppercase tracking-wider">{test.role} • {test.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 10. FAQ Accordions */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-secondary-900 dark:text-white leading-none">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1 font-medium">Need help? Read answers to common questions about StayMate</p>
        </div>

        <div className="border border-secondary-200/60 dark:border-secondary-800/60 rounded-[20px] overflow-hidden bg-white dark:bg-secondary-900 divide-y divide-secondary-200/60 dark:divide-secondary-800/60 shadow-premium-sm transition-all duration-300">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-secondary-850 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800/20 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-primary-600 shrink-0 stroke-[1.8]" /> : <ChevronDown className="h-4.5 w-4.5 text-secondary-400 shrink-0 stroke-[1.8]" />}
                </button>
                {isOpen && (
                  <div className="p-5 bg-secondary-50/50 dark:bg-secondary-900/20 text-xs text-secondary-500 dark:text-secondary-400 leading-relaxed border-t border-secondary-100 dark:border-secondary-800 animate-slide-up font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Learn More Explainer Modal */}
      {learnMoreTopic && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity" onClick={() => setLearnMoreTopic(null)} />
          
          {/* Modal Card */}
          <Card className="relative z-10 w-full max-w-lg p-6 md:p-8 space-y-6 animate-fade-in bg-white dark:bg-secondary-950 rounded-[28px] shadow-2xl border border-secondary-200/50 dark:border-secondary-900 select-text text-secondary-900 dark:text-white">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 flex items-center justify-center shrink-0">
                  {learnMoreTopic === 'verified' && <ShieldCheck className="h-5.5 w-5.5" />}
                  {learnMoreTopic === 'lifestyle' && <Sparkles className="h-5.5 w-5.5" />}
                  {learnMoreTopic === 'connection' && <Users className="h-5.5 w-5.5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-secondary-900 dark:text-white leading-none">
                    {learnMoreTopic === 'verified' && '100% Verified Profiles'}
                    {learnMoreTopic === 'lifestyle' && 'Lifestyle Compatibility'}
                    {learnMoreTopic === 'connection' && 'Instant Connection'}
                  </h3>
                  <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider mt-1.5">
                    {learnMoreTopic === 'verified' && 'Scam-free rental marketplace'}
                    {learnMoreTopic === 'lifestyle' && 'AI-driven compatibility score'}
                    {learnMoreTopic === 'connection' && 'Secure communications & schedulers'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setLearnMoreTopic(null)} 
                className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-900 rounded-full text-secondary-400 hover:text-secondary-650 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs leading-relaxed text-secondary-600 dark:text-secondary-400 font-medium">
              <p>
                {learnMoreTopic === 'verified' && 'Our operations team conducts comprehensive document audits, coordinate verification, and owner identity checks on every single listing to verify its authenticity before publishing.'}
                {learnMoreTopic === 'lifestyle' && 'We calculate lifestyle alignment based on essential habits to help you find a roommate who feels like home. Our system matches domestic, social, and sleeping parameters.'}
                {learnMoreTopic === 'connection' && 'Communicate with landlords and prospective roommates safely using our built-in real-time tools. Schedule physical property inspections or send match requests with a single click.'}
              </p>

              {/* Highlights */}
              <div className="space-y-3 pt-2">
                <h5 className="font-black text-secondary-800 dark:text-white uppercase tracking-wider text-[10px]">Key Features</h5>
                
                {learnMoreTopic === 'verified' && (
                  <>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">KYC Document Auditing:</strong> Mandatory ID verification on listing upload.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Coordinate Validation:</strong> Mapping geo-coordinates to prevent fake listings.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Anti-Scam Guard:</strong> Protects deposit payouts from upfront wire fraud.</p>
                    </div>
                  </>
                )}

                {learnMoreTopic === 'lifestyle' && (
                  <>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Cleanliness Alignment:</strong> Match neatness scales and chore distribution preferences.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Sleep Schedules:</strong> Compare night owls and early risers to avoid schedule clashes.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Social tolerances:</strong> Group compatibility based on guests, smoking, and WFH habits.</p>
                    </div>
                  </>
                )}

                {learnMoreTopic === 'connection' && (
                  <>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Secure Messaging:</strong> Integrated chat environment masking private emails/numbers.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Tour Scheduler:</strong> Choose inspection slots on property pages seamlessly.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="text-primary-500 font-extrabold">✓</span>
                      <p><strong className="font-bold text-secondary-800 dark:text-white">Accept/Decline Console:</strong> Structured match requests and connection dashboard.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setLearnMoreTopic(null)} 
                className="w-full font-bold py-2.5 rounded-xl shadow-premium-sm"
              >
                Got it, thanks!
              </Button>
            </div>
          </Card>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Home;
