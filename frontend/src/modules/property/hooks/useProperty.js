import { usePropertyContext } from '../context/PropertyContext.jsx';

export const useProperty = (propertyId = null) => {
  const {
    currentProperty,
    setCurrentProperty,
    loadingStates,
    errorStates,
    fetchPropertyDetail,
    updateProperty,
    publishProperty
  } = usePropertyContext();

  const loadProperty = async (id) => {
    return await fetchPropertyDetail(id || propertyId);
  };

  return {
    property: currentProperty,
    setProperty: setCurrentProperty,
    isLoading: loadingStates.fetchingDetail,
    isSaving: loadingStates.savingProperty,
    isPublishing: loadingStates.publishing,
    error: errorStates.detailError,
    loadProperty,
    updateProperty,
    publishProperty
  };
};

export default useProperty;
