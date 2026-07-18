import Property from '../models/Property.js';
import VisitRequest from '../models/VisitRequest.js';
import User from '../models/User.js';
import { isDbConnected, mockProperties, mockVisitRequests, mockUsers } from '../config/inMemoryDb.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import mongoose from 'mongoose';
import chatService from '../modules/chat/services/chatService.js';
import authEventEmitter from '../utils/eventEmitter.js';

// Help match user IDs offline or online
const matchIds = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

const getMockProperty = (id) => {
  const mocks = {
    'prop-1': {
      _id: 'prop-1',
      id: 'prop-1',
      title: 'Premium Double Room (Near Delhi Univ)',
      description: 'Beautiful and premium double sharing student room in North Campus, Delhi. Highly safe, fully furnished, close to university campus, transit stops, and local markets. Perfect for students and young professionals seeking a comfortable stay.',
      propertyType: 'room',
      listingType: 'rent',
      location: {
        country: 'India',
        state: 'Delhi',
        city: 'Delhi',
        area: 'North Campus',
        landmark: 'Near Vishwavidyalaya Metro Station',
        pinCode: '110007',
        latitude: 28.6976,
        longitude: 77.2106
      },
      pricing: {
        monthlyRent: 6500,
        securityDeposit: 13000,
        maintenanceCharges: 500,
        brokerage: 0
      },
      roomDetails: {
        bedrooms: 1,
        bathrooms: 1,
        balcony: 1,
        floor: 2,
        totalFloors: 4,
        areaSqFt: 180,
        furnishing: 'semi_furnished'
      },
      amenities: {
        ac: true,
        wifi: true,
        powerBackup: true,
        parking: true,
        lift: false,
        laundry: true,
        kitchen: true,
        gym: false,
        swimmingPool: false,
        security: true,
        cctv: true,
        housekeeping: true,
        foodIncluded: false
      },
      features: {
        verified: true,
        featured: true,
        premium: true
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80' }
      ],
      ownerId: {
        _id: '6a5686f546be09c83e4fff92',
        name: 'Demo Owner',
        email: 'owner@staymate.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      statistics: {
        views: 124,
        favorites: 52
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    'prop-2': {
      _id: 'prop-2',
      id: 'prop-2',
      title: 'Fully Furnished 2BHK flat',
      description: 'Stunning fully furnished 2 BHK apartment available for rent in Sector 15, Noida. Equipped with high-end modular kitchen, modern fixtures, active security, parking spaces, and access to a local gym facility. Clean, spacious, and family-friendly.',
      propertyType: 'flat',
      listingType: 'rent',
      location: {
        country: 'India',
        state: 'Uttar Pradesh',
        city: 'Noida',
        area: 'Sector 15',
        landmark: 'Near Sector 15 Metro Station',
        pinCode: '201301',
        latitude: 28.5833,
        longitude: 77.3167
      },
      pricing: {
        monthlyRent: 12000,
        securityDeposit: 24000,
        maintenanceCharges: 1000,
        brokerage: 0
      },
      roomDetails: {
        bedrooms: 2,
        bathrooms: 2,
        balcony: 2,
        floor: 4,
        totalFloors: 8,
        areaSqFt: 1050,
        furnishing: 'fully_furnished'
      },
      amenities: {
        ac: true,
        wifi: true,
        powerBackup: true,
        parking: true,
        lift: true,
        laundry: true,
        kitchen: true,
        gym: true,
        swimmingPool: false,
        security: true,
        cctv: true,
        housekeeping: false,
        foodIncluded: false
      },
      features: {
        verified: true,
        featured: true,
        premium: true
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80' }
      ],
      ownerId: {
        _id: '6a5686f546be09c83e4fff92',
        name: 'Demo Owner',
        email: 'owner@staymate.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      statistics: {
        views: 242,
        favorites: 96
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    'prop-3': {
      _id: 'prop-3',
      id: 'prop-3',
      title: 'Cozy PG with Meals included',
      description: 'Extremely comfortable paying guest accommodation for students and single professionals in Katraj, Pune. Package includes 3 fresh hygienic meals daily, Wi-Fi, laundry facilities, AC, housekeeping, and round-the-clock power backup. Homely vibe.',
      propertyType: 'pg',
      listingType: 'rent',
      location: {
        country: 'India',
        state: 'Maharashtra',
        city: 'Pune',
        area: 'Katraj',
        landmark: 'Near Bharati Vidyapeeth University',
        pinCode: '411046',
        latitude: 18.4529,
        longitude: 73.8553
      },
      pricing: {
        monthlyRent: 8000,
        securityDeposit: 8000,
        maintenanceCharges: 0,
        brokerage: 0
      },
      roomDetails: {
        bedrooms: 1,
        bathrooms: 1,
        balcony: 0,
        floor: 1,
        totalFloors: 3,
        areaSqFt: 150,
        furnishing: 'fully_furnished'
      },
      amenities: {
        ac: true,
        wifi: true,
        powerBackup: true,
        parking: false,
        lift: false,
        laundry: true,
        kitchen: false,
        gym: false,
        swimmingPool: false,
        security: true,
        cctv: true,
        housekeeping: true,
        foodIncluded: true
      },
      features: {
        verified: true,
        featured: true,
        premium: false
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=500&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80' }
      ],
      ownerId: {
        _id: '6a5686f546be09c83e4fff92',
        name: 'Demo Owner',
        email: 'owner@staymate.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      statistics: {
        views: 188,
        favorites: 74
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  };
  return mocks[id] || null;
};

export const propertyService = {
  /**
   * Create a new listing under owner
   */
  createProperty: async (ownerId, propertyData) => {
    const defaultData = {
      ownerId,
      status: 'draft',
      verification: 'pending',
      statistics: { views: 0, favorites: 0, visitRequests: 0 },
    };

    const combinedData = { ...propertyData, ...defaultData };

    if (isDbConnected()) {
      return await Property.create(combinedData);
    } else {
      const mockProp = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...combinedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProperties.push(mockProp);
      return mockProp;
    }
  },

  /**
   * Update listing details. Enforces owner verification.
   */
  updateProperty: async (propertyId, ownerId, updateData) => {
    let property;

    if (isDbConnected()) {
      property = await Property.findById(propertyId);
      if (!property) throw new NotFoundError('Property listing not found.');
      if (!matchIds(property.ownerId, ownerId)) {
        throw new ForbiddenError('Access Denied. You do not own this listing.');
      }
      
      // Update fields
      Object.assign(property, updateData);
      return await property.save();
    } else {
      property = mockProperties.find((p) => matchIds(p._id, propertyId));
      if (!property) throw new NotFoundError('Property listing not found.');
      if (!matchIds(property.ownerId, ownerId)) {
        throw new ForbiddenError('Access Denied. You do not own this listing.');
      }

      Object.assign(property, updateData);
      property.updatedAt = new Date();
      return property;
    }
  },

  /**
   * Archives a property listing (soft-delete)
   */
  deleteProperty: async (propertyId, ownerId) => {
    return await propertyService.updateProperty(propertyId, ownerId, { status: 'archived' });
  },

  /**
   * Duplicates an existing listing to jumpstart a new draft
   */
  duplicateProperty: async (propertyId, ownerId) => {
    let property;
    if (isDbConnected()) {
      property = await Property.findById(propertyId).lean();
    } else {
      property = mockProperties.find((p) => matchIds(p._id, propertyId));
    }

    if (!property) throw new NotFoundError('Source property not found.');
    if (!matchIds(property.ownerId, ownerId)) {
      throw new ForbiddenError('Access Denied. You do not own this listing.');
    }

    // Clone data and reset keys
    const clonedData = {
      ...property,
      _id: undefined,
      title: `${property.title} (Copy)`,
      status: 'draft',
      verification: 'pending',
      statistics: { views: 0, favorites: 0, visitRequests: 0 },
      createdAt: undefined,
      updatedAt: undefined,
    };

    if (isDbConnected()) {
      return await Property.create(clonedData);
    } else {
      const mockProp = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...clonedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProperties.push(mockProp);
      return mockProp;
    }
  },

  /**
   * Retrieve filtered listings feed (Section 5 & 6)
   */
  getProperties: async (filters = {}) => {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query criteria
    const query = { status: 'published' };

    if (filters.city) {
      query['location.city'] = { $regex: new RegExp(filters.city, 'i') };
    }
    if (filters.area) {
      query['location.area'] = { $regex: new RegExp(filters.area, 'i') };
    }
    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }
    if (filters.listingType) {
      query.listingType = filters.listingType;
    }
    if (filters.occupancy) {
      query.occupancy = filters.occupancy;
    }
    if (filters.furnishing) {
      query['roomDetails.furnishing'] = filters.furnishing;
    }
    if (filters.verified === 'true') {
      query.verification = 'verified';
    }

    // Pricing filters
    if (filters.rentMin || filters.rentMax) {
      query['pricing.monthlyRent'] = {};
      if (filters.rentMin) query['pricing.monthlyRent'].$gte = parseFloat(filters.rentMin);
      if (filters.rentMax) query['pricing.monthlyRent'].$lte = parseFloat(filters.rentMax);
    }

    // Room count details
    if (filters.bedrooms) {
      query['roomDetails.bedrooms'] = parseInt(filters.bedrooms);
    }
    if (filters.bathrooms) {
      query['roomDetails.bathrooms'] = { $gte: parseInt(filters.bathrooms) };
    }

    // Amenities parsing (WiFi, AC, Parking, etc.)
    const booleanFields = [
      'ac', 'wifi', 'powerBackup', 'parking', 'lift', 'laundry', 'kitchen',
      'gym', 'swimmingPool', 'security', 'cctv', 'housekeeping', 'foodIncluded'
    ];
    booleanFields.forEach((field) => {
      if (filters[field] === 'true') {
        query[`amenities.${field}`] = true;
      }
    });

    // Handle Text Search Query
    if (filters.search) {
      const regexSearch = { $regex: new RegExp(filters.search, 'i') };
      query.$or = [
        { title: regexSearch },
        { description: regexSearch },
        { 'location.city': regexSearch },
        { 'location.area': regexSearch },
      ];
    }

    // Sort order
    let sortObj = { createdAt: -1 }; // default newest
    if (filters.sort) {
      if (filters.sort === 'price_asc') sortObj = { 'pricing.monthlyRent': 1 };
      else if (filters.sort === 'price_desc') sortObj = { 'pricing.monthlyRent': -1 };
      else if (filters.sort === 'oldest') sortObj = { createdAt: 1 };
      else if (filters.sort === 'popularity') sortObj = { 'statistics.views': -1 };
    }

    if (isDbConnected()) {
      const properties = await Property.find(query)
        .populate('ownerId', 'name avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);

      const total = await Property.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        properties,
        pagination: { page, limit, total, pages },
      };
    } else {
      // In-memory array filter simulation
      let filtered = mockProperties.filter((p) => {
        // Status filter
        if (p.status !== 'published') return false;

        // Custom filter evaluation
        if (filters.city && !p.location.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
        if (filters.area && !p.location.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
        if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
        if (filters.listingType && p.listingType !== filters.listingType) return false;
        if (filters.occupancy && p.occupancy !== filters.occupancy) return false;
        if (filters.furnishing && p.roomDetails?.furnishing !== filters.furnishing) return false;
        if (filters.verified === 'true' && p.verification !== 'verified') return false;

        if (filters.rentMin && p.pricing.monthlyRent < parseFloat(filters.rentMin)) return false;
        if (filters.rentMax && p.pricing.monthlyRent > parseFloat(filters.rentMax)) return false;

        if (filters.bedrooms && p.roomDetails?.bedrooms !== parseInt(filters.bedrooms)) return false;

        // Check boolean amenity flags
        for (const field of booleanFields) {
          if (filters[field] === 'true' && !p.amenities?.[field]) return false;
        }

        // Text search
        if (filters.search) {
          const s = filters.search.toLowerCase();
          const match = p.title.toLowerCase().includes(s) || 
                        p.description.toLowerCase().includes(s) || 
                        p.location.city.toLowerCase().includes(s);
          if (!match) return false;
        }

        return true;
      });

      // Simulated Sort
      filtered.sort((a, b) => {
        if (filters.sort === 'price_asc') return a.pricing.monthlyRent - b.pricing.monthlyRent;
        if (filters.sort === 'price_desc') return b.pricing.monthlyRent - a.pricing.monthlyRent;
        if (filters.sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (filters.sort === 'popularity') return b.statistics.views - a.statistics.views;
        return new Date(b.createdAt) - new Date(a.createdAt); // newest default
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);
      const pages = Math.ceil(total / limit);

      return {
        properties: paginated,
        pagination: { page, limit, total, pages },
      };
    }
  },

  /**
   * Retrieves specific property details and increments statistic view count
   */
  getPropertyById: async (propertyId) => {
    if (typeof propertyId === 'string' && propertyId.startsWith('prop-')) {
      const mockProp = getMockProperty(propertyId);
      if (mockProp) return mockProp;
    }
    let property;
    if (isDbConnected()) {
      property = await Property.findById(propertyId).populate('ownerId', 'name email avatar phone');
      if (!property) throw new NotFoundError('Property not found.');

      // Increment views counter
      property.statistics.views += 1;
      await property.save();
      return property;
    } else {
      property = mockProperties.find((p) => matchIds(p._id, propertyId));
      if (!property) throw new NotFoundError('Property not found.');

      property.statistics = property.statistics || { views: 0, favorites: 0, visitRequests: 0 };
      property.statistics.views += 1;

      // Mock owner populate info
      const owner = mockUsers.find((u) => matchIds(u._id, property.ownerId)) || { name: 'Owner', avatar: '' };
      return { ...property, ownerId: owner };
    }
  },

  /**
   * Owner dashboard analytics properties
   */
  getOwnerProperties: async (ownerId) => {
    if (isDbConnected()) {
      return await Property.find({ ownerId });
    } else {
      return mockProperties.filter((p) => matchIds(p.ownerId, ownerId));
    }
  },

  /**
   * Add/Remove listing from user favorites wishlist
   */
  toggleWishlist: async (userId, propertyId) => {
    if (typeof propertyId === 'string' && propertyId.startsWith('prop-')) {
      return {
        message: 'Listing added to wishlist (Demo Mode).',
        isWishlisted: true
      };
    }
    let message = 'Listing added to wishlist.';
    let isWishlisted = false;

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError('User not found.');

      const index = user.wishlist.indexOf(propertyId);
      if (index === -1) {
        user.wishlist.push(propertyId);
        isWishlisted = true;
        
        // Increment statistics counter
        await Property.findByIdAndUpdate(propertyId, { $inc: { 'statistics.favorites': 1 } });
      } else {
        user.wishlist.splice(index, 1);
        message = 'Listing removed from wishlist.';
        
        await Property.findByIdAndUpdate(propertyId, { $inc: { 'statistics.favorites': -1 } });
      }

      await user.save();
    } else {
      const user = mockUsers.find((u) => matchIds(u._id, userId));
      if (!user) throw new NotFoundError('User not found.');

      user.wishlist = user.wishlist || [];
      const idx = user.wishlist.findIndex((id) => matchIds(id, propertyId));
      if (idx === -1) {
        user.wishlist.push(propertyId);
        isWishlisted = true;
        
        const prop = mockProperties.find((p) => matchIds(p._id, propertyId));
        if (prop) {
          prop.statistics = prop.statistics || { views: 0, favorites: 0, visitRequests: 0 };
          prop.statistics.favorites += 1;
        }
      } else {
        user.wishlist.splice(idx, 1);
        message = 'Listing removed from wishlist.';
        
        const prop = mockProperties.find((p) => matchIds(p._id, propertyId));
        if (prop && prop.statistics?.favorites > 0) {
          prop.statistics.favorites -= 1;
        }
      }
    }

    return { success: true, message, isWishlisted };
  },

  /**
   * Fetch populated wishlist items
   */
  getWishlist: async (userId) => {
    if (isDbConnected()) {
      const user = await User.findById(userId).populate({
        path: 'wishlist',
        populate: { path: 'ownerId', select: 'name avatar' },
      });
      return user ? user.wishlist : [];
    } else {
      const user = mockUsers.find((u) => matchIds(u._id, userId));
      if (!user || !user.wishlist) return [];
      
      return mockProperties.filter((p) => user.wishlist.some((id) => matchIds(id, p._id)));
    }
  },

  /**
   * Create scheduling request to tour a property (Section 9)
   */
  requestVisit: async (tenantId, { propertyId, date, time, note }) => {
    let property;
    if (isDbConnected()) {
      property = await Property.findById(propertyId);
    } else {
      property = mockProperties.find((p) => matchIds(p._id, propertyId));
    }

    if (!property) throw new NotFoundError('Target property listing not found.');

    const visitPayload = {
      propertyId,
      tenantId,
      ownerId: property.ownerId,
      date,
      time,
      note,
      status: 'pending',
    };

    let request;
    if (isDbConnected()) {
      request = await VisitRequest.create(visitPayload);
      // Increment statistics
      property.statistics.visitRequests += 1;
      await property.save();
    } else {
      request = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...visitPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockVisitRequests.push(request);
      
      property.statistics = property.statistics || { views: 0, favorites: 0, visitRequests: 0 };
      property.statistics.visitRequests += 1;
    }

    try {
      // Automatically create a visit conversation thread
      const oId = property.ownerId._id || property.ownerId;
      const conv = await chatService.getOrCreateConversation(
        'visit',
        request._id,
        'VisitRequest',
        [tenantId, oId]
      );
      
      // Send system message
      const formattedVisitDate = new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      await chatService.sendSystemMessage(
        conv._id,
        `Visit request scheduled for "${property.title || property.basicInfo?.title}" on ${formattedVisitDate} at ${time}.`
      );
    } catch (err) {
      console.error('Failed to auto-create visit conversation:', err.message);
    }

    authEventEmitter.emit('visit:requested', { visit: request });
    return request;
  },

  /**
   * Fetch scheduled visit logs
   */
  getVisitRequests: async (userId, role) => {
    const query = role === 'owner' ? { ownerId: userId } : { tenantId: userId };

    if (isDbConnected()) {
      return await VisitRequest.find(query)
        .populate('propertyId', 'title location images pricing')
        .populate(role === 'owner' ? 'tenantId' : 'ownerId', 'name email avatar phone');
    } else {
      const list = mockVisitRequests.filter((v) => matchIds(role === 'owner' ? v.ownerId : v.tenantId, userId));
      
      // Mock populating
      return list.map((v) => {
        const prop = mockProperties.find((p) => matchIds(p._id, v.propertyId)) || { title: 'Unknown Property', images: [], pricing: { monthlyRent: 0 } };
        const counterpartyId = role === 'owner' ? v.tenantId : v.ownerId;
        const counterparty = mockUsers.find((u) => matchIds(u._id, counterpartyId)) || { name: 'User', email: '', avatar: '' };
        
        return {
          ...v,
          propertyId: prop,
          [role === 'owner' ? 'tenantId' : 'ownerId']: counterparty,
        };
      });
    }
  },

  /**
   * Updates visit request booking status
   */
  updateVisitRequest: async (requestId, userId, { status, rescheduleReason }) => {
    let request;
    let updatedRequest;
    if (isDbConnected()) {
      request = await VisitRequest.findById(requestId);
      if (!request) throw new NotFoundError('Visit request not found.');
      
      // Enforce that only the target owner/landlord can alter status
      if (!matchIds(request.ownerId, userId)) {
        throw new ForbiddenError('Access Denied. You do not own this property.');
      }

      request.status = status;
      if (rescheduleReason) {
        request.rescheduleReason = rescheduleReason;
      }
      updatedRequest = await request.save();
    } else {
      request = mockVisitRequests.find((v) => matchIds(v._id, requestId));
      if (!request) throw new NotFoundError('Visit request not found.');
      if (!matchIds(request.ownerId, userId)) {
        throw new ForbiddenError('Access Denied. You do not own this property.');
      }

      request.status = status;
      if (rescheduleReason) {
        request.rescheduleReason = rescheduleReason;
      }
      request.updatedAt = new Date();
      updatedRequest = request;
    }

    try {
      const conv = await chatService.getOrCreateConversation(
        'visit',
        requestId,
        'VisitRequest',
        [request.tenantId, request.ownerId]
      );
      
      let systemText = `Visit request status changed to ${status}.`;
      if (status === 'accepted') {
        systemText = `Visit request approved!`;
      } else if (status === 'rejected') {
        systemText = `Visit request declined.`;
      } else if (status === 'rescheduled') {
        systemText = `Visit request rescheduled. Reason: ${rescheduleReason || 'None'}`;
      }
      
      await chatService.sendSystemMessage(conv._id, systemText);
    } catch (err) {
      console.error('Failed to post visit status system message:', err.message);
    }

    // Emit event with lastUpdatedBy track details
    const visitObj = typeof updatedRequest.toObject === 'function' ? updatedRequest.toObject() : updatedRequest;
    const visitWithUpdatedBy = {
      ...visitObj,
      lastUpdatedBy: userId
    };
    authEventEmitter.emit(`visit:${status}`, { visit: visitWithUpdatedBy });
    return updatedRequest;
  },
};

export default propertyService;
