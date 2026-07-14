import { usePropertyContext } from '../context/PropertyContext.jsx';
import { useCallback } from 'react';

export const useDraftProperty = () => {
  const {
    draftProperty,
    setDraftProperty,
    currentStep,
    setCurrentStep,
    autoSaveTimestamp,
    setAutoSaveTimestamp,
    createProperty,
    updateProperty,
    publishProperty,
    discardDraft,
    uploadImages,
    loadingStates,
    errorStates
  } = usePropertyContext();

  const saveDraft = useCallback(async (formData) => {
    try {
      if (!draftProperty) {
        // Initial creation of draft
        return await createProperty(formData);
      } else {
        // Incremental save of details
        return await updateProperty(draftProperty._id, formData);
      }
    } catch (err) {
      console.error('Draft save failed:', err);
      throw err;
    }
  }, [draftProperty, createProperty, updateProperty]);

  const discard = useCallback(async () => {
    if (draftProperty && draftProperty._id) {
      await discardDraft(draftProperty._id);
    } else {
      setDraftProperty(null);
      setCurrentStep(1);
    }
  }, [draftProperty, discardDraft, setDraftProperty, setCurrentStep]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  }, [setCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, [setCurrentStep]);

  return {
    draft: draftProperty,
    setDraft: setDraftProperty,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    autoSaveTimestamp,
    setAutoSaveTimestamp,
    saveDraft,
    publish: publishProperty,
    discard,
    uploadImages,
    isSaving: loadingStates.savingProperty,
    isUploading: loadingStates.uploadingImages,
    isPublishing: loadingStates.publishing,
    saveError: errorStates.saveError,
    uploadError: errorStates.uploadError
  };
};

export default useDraftProperty;
