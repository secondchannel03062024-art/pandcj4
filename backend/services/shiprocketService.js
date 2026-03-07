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
            pickup_postcode: '712103', // Warehouse location
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
    } else {
      console.warn('[Shipping] ⚠️ SHIPROCKET_API_TOKEN not set - skipping API check');
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
            pickup_postcode: '712103', // Warehouse location
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

        console.log(`[Shipping] Shiprocket API - Calculated ₹${cheapestCourier.rate} for ${pincode}`);
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
    } else {
      console.warn('[Shipping] ⚠️ SHIPROCKET_API_TOKEN not set - using fallback pricing');
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
      message: `Using distance-based shipping rates (Fallback - ${cost === 40 ? 'Local' : cost === 50 ? 'Regional' : cost === 75 ? 'Metro' : cost === 85 ? 'Tier-2' : cost === 150 ? 'North-East' : cost === 120 ? 'Remote' : 'Standard'})`,
    };
  } catch (error) {
    console.error('[Shipping] Calculate error:', error.message);

    // Return fallback cost on error
    const fallbackCost = getFallbackShippingCost(pincode);
    return {
      cost: fallbackCost,
      available: true,
      fallbackCost,
      message: 'Shipping calculation error - using backup rates',
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
 * Warehouse location: Mumbai (400001)
 * @param {string} pincode - Destination pincode
 * @returns {number} Shipping cost in rupees
 */
const getFallbackShippingCost = (pincode) => {
  const pincodeStr = String(pincode).substring(0, 3);
  
  // Zone 1: Same city - Mumbai metro area
  const zone1Patterns = ['400', '401', '402', '410'];
  if (zone1Patterns.includes(pincodeStr)) {
    return 40; // Same city
  }

  // Zone 2: Adjacent metros & nearby states (short distance)
  const zone2Patterns = ['411', '412', '413', '414', '415', '416', '421', '440', '470']; // Pune, nearby areas
  if (zone2Patterns.includes(pincodeStr)) {
    return 50;
  }

  // Zone 3: Major metros (medium distance from warehouse)
  const zone3Patterns = ['110', '560', '700', '380', '362', '390']; // Delhi, Bangalore, Kolkata, Ahmedabad, Surat, Vadodara
  if (zone3Patterns.includes(pincodeStr)) {
    return 75;
  }

  // Zone 4: Tier-2 cities & states (medium-long distance)
  const zone4Patterns = ['201', '202', '395', '301', '302', '303', '452']; // Noida, Ghaziabad, Rajkot, Indore, Jaipur, Nashik
  if (zone4Patterns.includes(pincodeStr)) {
    return 85;
  }

  // Zone 5: North-East India (longest distance, remote areas)
  const northEastPatterns = ['794', '788', '797', '798', '799', '713', '761'];
  if (northEastPatterns.includes(pincodeStr)) {
    return 150;
  }

  // Zone 6: Remote/hilly areas
  const remotePatterns = ['176', '177', '178', '175', '174', '171', '170']; // Himachal Pradesh
  if (remotePatterns.includes(pincodeStr)) {
    return 120;
  }

  // Default: All other areas (rest of India)
  return 80;
};

module.exports = {
  checkServiceability,
  calculateShippingCharges,
  getShippingCost,
  validatePincode,
};
