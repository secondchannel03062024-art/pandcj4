// Frontend Shiprocket Integration Service
// Calculates real-time shipping charges based on user's pincode

import { config } from '../config/env';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Validate pincode format (6 digits for India)
 */
export const validatePincodeFormat = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

/**
 * Check if a pincode is serviceable and get available courier options
 * @param {string} pincode - User's pincode
 * @returns {Promise<Object>} - Serviceability data
 */
export const checkServiceability = async (pincode: string): Promise<any> => {
  try {
    if (!validatePincodeFormat(pincode)) {
      return {
        success: false,
        serviceable: false,
        message: 'Invalid pincode format. Please enter a 6-digit pincode.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/shipping/check/${pincode}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Serviceability check error:', error);
    return {
      success: false,
      serviceable: false,
      message: 'Unable to check serviceability. Please try again.',
    };
  }
};

/**
 * Calculate shipping charge for checkout
 * @param {string} destinationPincode - User's pincode
 * @param {number} weight - Package weight in kg (default: 0.5)
 * @param {number} subtotal - Order subtotal for COD charges
 * @returns {Promise<Object>} - Shipping cost and details
 */
export const calculateShippingCharge = async (
  destinationPincode: string,
  weight: number = 0.5,
  subtotal: number = 0
): Promise<{
  available: boolean;
  cost: number;
  courier?: string;
  deliveryDays?: number;
  message: string;
}> => {
  try {
    // Validate pincode
    if (!destinationPincode) {
      return {
        available: false,
        cost: 0,
        message: 'Please enter your pincode',
      };
    }

    if (!validatePincodeFormat(destinationPincode)) {
      return {
        available: false,
        cost: 0,
        message: 'Invalid pincode format',
      };
    }

    // Check if already retrieved recently (cache for 5 minutes)
    const cacheKey = `shipping_${destinationPincode}_${weight}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        return cachedData.data;
      }
    }

    // Call backend shipping API
    const response = await fetch(`${API_BASE_URL}/shipping/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationPincode,
        weight,
        amount: subtotal,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle response
    if (result.success && result.data.available) {
      const shippingData = {
        available: true,
        cost: result.data.shippingCost,
        courier: result.data.courier,
        deliveryDays: result.data.deliveryDays,
        message: result.data.message || `Shipping: ₹${result.data.shippingCost}`,
      };

      // Cache the result
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: shippingData,
          timestamp: Date.now(),
        })
      );

      return shippingData;
    } else {
      // Location not serviceable
      const fallbackCost = result.data.fallbackCost || 100;
      return {
        available: true, // Still allow checkout with fallback cost
        cost: fallbackCost,
        message: result.data.message || 'Shipping not available in your area. Using standard rate.',
      };
    }
  } catch (error) {
    console.error('Shipping calculation error:', error);

    // Return fallback shipping cost if API fails
    return {
      available: true,
      cost: 100, // Default fallback cost
      message: 'Using standard shipping rate',
    };
  }
};

/**
 * Get all available shipping options for a pincode
 * @param {string} pincode - User's pincode
 * @param {number} weight - Package weight in kg
 * @returns {Promise<Array>} - Array of shipping options
 */
export const getShippingOptions = async (
  pincode: string,
  weight: number = 0.5
): Promise<any[]> => {
  try {
    if (!validatePincodeFormat(pincode)) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/shipping/rates/${pincode}?weight=${weight}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.shippingOptions) {
      return data.shippingOptions;
    }

    return [];
  } catch (error) {
    console.error('Get shipping options error:', error);
    return [];
  }
};

/**
 * Validate pincode and return serviceability status
 * @param {string} pincode - User's pincode
 * @returns {Promise<Object>} - Validation result with serviceability
 */
export const validatePincode = async (
  pincode: string
): Promise<{
  valid: boolean;
  format: boolean;
  serviceable: boolean;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shipping/validate-pincode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pincode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      valid: data.valid,
      format: data.format !== false,
      serviceable: data.serviceable,
      message: data.message,
    };
  } catch (error) {
    console.error('Pincode validation error:', error);
    return {
      valid: false,
      format: false,
      serviceable: false,
      message: 'Unable to validate pincode',
    };
  }
};

/**
 * Format shipping cost for display
 */
export const formatShippingCost = (cost: number): string => {
  return `₹${cost.toFixed(0)}`;
};

/**
 * Get estimated delivery message
 */
export const getDeliveryMessage = (deliveryDays?: number, zipCode?: string): string => {
  if (!deliveryDays) {
    return 'Delivery time varies by location';
  }

  if (deliveryDays <= 2) {
    return `🚚 Express Delivery - ${deliveryDays} days`;
  } else if (deliveryDays <= 5) {
    return `📦 Standard Delivery - ${deliveryDays} days`;
  } else {
    return `🐢 Economy Delivery - ${deliveryDays} days`;
  }
};

export default {
  validatePincodeFormat,
  checkServiceability,
  calculateShippingCharge,
  getShippingOptions,
  validatePincode,
  formatShippingCost,
  getDeliveryMessage,
};
