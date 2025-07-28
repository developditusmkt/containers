// Utility functions for input masking without deprecated APIs

export const applyPhoneMask = (value: string): string => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  // Apply phone mask (99) 99999-9999
  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 7) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
  } else {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
  }
};

export const applyCepMask = (value: string): string => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  // Apply CEP mask 99999-999
  if (numericValue.length <= 5) {
    return numericValue;
  } else {
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  }
};

export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Custom hook for masked input
export const useMaskedInput = (mask: 'phone' | 'cep') => {
  const applyMask = (value: string): string => {
    switch (mask) {
      case 'phone':
        return applyPhoneMask(value);
      case 'cep':
        return applyCepMask(value);
      default:
        return value;
    }
  };

  const handleChange = (
    onChange: (value: string) => void,
    onMaskedChange?: (maskedValue: string) => void
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const maskedValue = applyMask(rawValue);
      
      // Update the input field with masked value
      event.target.value = maskedValue;
      
      // Call the original onChange with raw numeric value
      onChange(removeMask(rawValue));
      
      // Call optional masked change handler
      if (onMaskedChange) {
        onMaskedChange(maskedValue);
      }
    };
  };

  return { applyMask, handleChange, removeMask };
};
