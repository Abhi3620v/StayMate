import { usePropertyContext } from '../context/PropertyContext.jsx';

export const usePropertyFilters = () => {
  const { filters, setFilters } = usePropertyContext();

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      propertyType: '',
      listingType: '',
      status: '',
      limit: 20,
      skip: 0
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters
  };
};

export default usePropertyFilters;
