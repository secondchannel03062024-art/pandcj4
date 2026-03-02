const axios = require('axios');

// Shiprocket API configuration
const SHIPROCKET_API_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_API_TOKEN = process.env.SHIPROCKET_API_TOKEN;

// Default shipping rates if Shiprocket is unavailable
const DEFAULT_SHIPPING_COSTS = {
  metro: 40,
  nonMetro: 60,
  northEast: 100,
};

// Shiprocket API headers
const getHeaders = () => ({
  'Authorization': `Bearer ${SHIPROCKET_API_TOKEN}`,
  'Content-Type': 'application/json',
});

/**
 * Check if a pincode is serviceable by Shiprocket
 * @param {string} pincode - 6-digit pincode
 * @returns {object} Serviceability result
 */
const checkServiceability = async (pincode) => {
  try {
    if (!validatePincode(pincode)) {
      return {
        serviceable: false,
        message: 'Invalid pincode format',
      };
    }

    // Try to use Shiprocket API if token is available
    if (SHIPROCKET_API_TOKEN) {
      const response = await axios.get(
        `${SHIPROCKET_API_BASE_URL}/courier/serviceability/`,
        {
          params: {
            pickup_postcode: '400001', // Default pickup location
            delivery_postcode: pincode,
            weight: 0.5,
            cod: 0,
          },
          headers: getHeaders(),
          timeout: 5000,
        }
      );

      const couriers = response.data?.data?.available_courier_companies || [];
      return {
        serviceable: couriers.length > 0,
        couriers,
        message: couriers.length > 0 ? 'Location is serviceable' : 'Location is not serviceable',
      };
    }

    // Fallback: Assume all Indian pincodes are serviceable
    console.log('[Shipping] Using fallback serviceability check for pincode:', pincode);
    return {
      serviceable: true,
      couriers: [{ id: 1, name: 'Default Courier' }],
      message: 'Location is serviceable',
    };
  } catch (error) {
    console.error('[Shipping] Serviceability check error:', error.message);
    
    // Fallback to success if API is unavailable
    return {
      serviceable: true,
      couriers: [],
      message: 'Serviceability check not available',
      error: error.message,
    };
  }
};

/**
 * Calculate shipping charges for a given pincode and weight
 * @param {string} pincode - Destination pincode
 * @param {number} weight - Package weight in kg
 * @param {number} amount - Order amount for COD calculation
 * @returns {object} Shipping calculation result
 */
const calculateShippingCharges = async (pincode, weight = 0.5, amount = 0) => {
  try {
    if (!validatePincode(pincode)) {
      return {
        cost: DEFAULT_SHIPPING_COSTS.nonMetro,
        available: false,
        message: 'Invalid pincode',
      };
    }

    // Try Shiprocket API if available
    if (SHIPROCKET_API_TOKEN) {
      const response = await axios.get(
        `${SHIPROCKET_API_BASE_URL}/courier/serviceability/`,
        {
          params: {
            pickup_postcode: '400001',
            delivery_postcode: pincode,
            weight,
            cod: amount > 0 ? 1 : 0,
          },
          headers: getHeaders(),
          timeout: 5000,
        }
      );

      const couriers = response.data?.data?.available_courier_companies || [];
      if (couriers.length > 0) {
        const cheapestCourier = couriers.reduce((prev, current) =>
          (prev.rate || Infinity) < (current.rate || Infinity) ? prev : current
        );

        return {
          cost: Math.ceil(cheapestCourier.rate || DEFAULT_SHIPPING_COSTS.nonMetro),
          available: true,
          courier: cheapestCourier.name,
          deliveryDays: cheapestCourier.estimated_days || '5-7',
          allOptions: couriers.map(c => ({
            name: c.name,
            rate: c.rate,
            estimatedDays: c.estimated_days,
          })),
        };
      }
    }

    // Fallback: Use default pricing based on pincode pattern
    console.log('[Shipping] Using fallback pricing for pincode:', pincode);
    const cost = getFallbackShippingCost(pincode);
    
    return {
      cost,
      available: true,
      courier: 'Standard Courier',
      deliveryDays: '5-7',
      fallbackCost: cost,
      message: 'Using standard shipping rates',
    };
  } catch (error) {
    console.error('[Shipping] Calculate error:', error.message);

    // Return fallback cost on error
    const fallbackCost = getFallbackShippingCost(pincode);
    return {
      cost: fallbackCost,
      available: true,
      fallbackCost,
      message: 'Shipping calculation not available',
      error: error.message,
    };
  }
};

/**
 * Get shipping cost - wrapper for backwards compatibility
 * @param {string} pincode - Destination pincode
 * @param {number} weight - Package weight
 * @returns {object} Shipping cost result
 */
const getShippingCost = async (pincode, weight = 0.5) => {
  return calculateShippingCharges(pincode, weight);
};

/**
 * Validate pincode format (Indian format: 6 digits)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} Validation result
 */
const validatePincode = (pincode) => {
  if (!pincode) return false;
  
  const pincodeStr = String(pincode).trim();
  
  // Check if it's a 6-digit number
  const isValid = /^\d{6}$/.test(pincodeStr);
  
  return isValid;
};

/**
 * Get fallback shipping cost based on pincode pattern
 * Used when Shiprocket API is unavailable
 * @param {string} pincode - Destination pincode
 * @returns {number} Shipping cost in rupees
 */
const getFallbackShippingCost = (pincode) => {
  // Metro areas (Mumbai: 400xxx, Delhi: 110xxx, Bangalore: 560xxx)
  const metroPatterns = ['400', '110', '560', '700', '411', '452', '201'];
  const pincodeStr = String(pincode).substring(0, 3);

  if (metroPatterns.includes(pincodeStr)) {
    return DEFAULT_SHIPPING_COSTS.metro;
  }

  // North-East India patterns (higher shipping cost)
  const northEastPatterns = ['794', '788', '797', '798', '799', '713', '761'];
  if (northEastPatterns.includes(pincodeStr)) {
    return DEFAULT_SHIPPING_COSTS.northEast;
  }

  // Default non-metro rate
  return DEFAULT_SHIPPING_COSTS.nonMetro;
};

module.exports = {
  checkServiceability,
  calculateShippingCharges,
  getShippingCost,
  validatePincode,
};
