import mongoose from 'mongoose';

const locationMetricSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: false,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    area: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    metricType: {
      type: String,
      enum: ['map_view', 'search_traffic', 'nearby_click', 'bounds_filter'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const LocationMetric = mongoose.model('LocationMetric', locationMetricSchema);

export default LocationMetric;
