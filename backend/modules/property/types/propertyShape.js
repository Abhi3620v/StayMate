/**
 * Shape Structure Definitions mapping property details to Search Indices
 */

export const mapPropertyToSearchIndex = (property) => {
  if (!property) return null;
  return {
    id: property._id || property.id,
    title: property.title,
    city: property.location?.city,
    area: property.location?.area,
    propertyType: property.propertyType,
    listingType: property.listingType,
    rent: property.pricing?.monthlyRent,
    bedrooms: property.roomDetails?.bedrooms,
    furnishing: property.roomDetails?.furnishing,
    status: property.status,
    verified: property.features?.verified || false,
    featured: property.features?.featured || false,
    amenities: Object.keys(property.amenities || {})
      .filter(key => property.amenities[key] === true),
    coverImage: property.images?.find(img => img.isPrimary)?.url || property.images?.[0]?.url || null,
    updatedAt: property.metadata?.updatedAt || property.updatedAt
  };
};

export default mapPropertyToSearchIndex;
