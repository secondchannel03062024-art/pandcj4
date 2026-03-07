const axios = require('axios');

// Shiprocket API configuration
const SHIPROCKET_API_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_API_KEY = process.env.SHIPROCKET_API_KEY;

// Default shipping rates if Shiprocket is unavailable
const DEFAULT_SHIPPING_COSTS = {
  metro: 40,
  nonMetro: 60,
  northEast: 100,
};

// Shiprocket API headers
const getHeaders = () => ({
  'Authorization': `Bearer ${SHIPROCKET_API_KEY}`,
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
    if (SHIPROCKET_API_KEY) {
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
      console.warn('[Shipping] ⚠️ SHIPROCKET_API_KEY not set - skipping API check');
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
    if (SHIPROCKET_API_KEY) {
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
      console.warn('[Shipping] ⚠️ SHIPROCKET_API_KEY not set - using fallback pricing');
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
 * Warehouse location: Kolkata (712103)
 * @param {string} pincode - Destination pincode
 * @returns {number} Shipping cost in rupees
 */
const getFallbackShippingCost = (pincode) => {
  const pincodeStr = String(pincode).substring(0, 3);
  
  // ZONE 1: Kolkata & West Bengal local (0-200 km) - CLOSEST
  const zone1Patterns = ['700', '701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719'];
  if (zone1Patterns.includes(pincodeStr)) {
    return 40; // Local delivery
  }

  // ZONE 2: North-East India - Assam, Tripura, Manipur (500-1000 km)
  const zone2Patterns = ['794', '788', '797', '798', '799', '761', '762', '763', '764', '765'];
  if (zone2Patterns.includes(pincodeStr)) {
    return 60;
  }

  // ZONE 3: Surat & Gujarat coast (1200-1300 km)
  const zone3Patterns = ['362', '363', '364', '365'];
  if (zone3Patterns.includes(pincodeStr)) {
    return 70;
  }

  // ZONE 4: Ahmedabad & Gujarat region (1200-1300 km)
  const zone4Patterns = ['380', '381', '382', '383', '384', '385', '386', '387', '388', '389'];
  if (zone4Patterns.includes(pincodeStr)) {
    return 75;
  }

  // ZONE 5: Vadodara, Rajkot, Bhavnagar (1200-1600 km)
  const zone5Patterns = ['390', '391', '392', '393', '394', '395', '396', '361'];
  if (zone5Patterns.includes(pincodeStr)) {
    return 80;
  }

  // ZONE 6: Indore, Nashik, Aurangabad (1400-1600 km)
  const zone6Patterns = ['452', '453', '454', '421', '422', '423', '424', '425', '431', '432', '433', '434', '435'];
  if (zone6Patterns.includes(pincodeStr)) {
    return 85;
  }

  // ZONE 7: Pune, Nagpur, Vikarabad (1600-1800 km)
  const zone7Patterns = ['410', '411', '412', '413', '414', '415', '416', '417', '418', '419', '440', '441', '442', '443', '444', '445', '446', '447', '448', '449'];
  if (zone7Patterns.includes(pincodeStr)) {
    return 90;
  }

  // ZONE 8: Mumbai & Maharashtra coast (1900-2000 km)
  const zone8Patterns = ['400', '401', '402', '403', '404', '405', '406', '407', '408', '409'];
  if (zone8Patterns.includes(pincodeStr)) {
    return 95;
  }

  // ZONE 9: Delhi, NCR, Noida, Ghaziabad (1400-1500 km)
  const zone9Patterns = ['110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210'];
  if (zone9Patterns.includes(pincodeStr)) {
    return 100;
  }

  // ZONE 10: Jaipur & Rajasthan (1500-1700 km)
  const zone10Patterns = ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310'];
  if (zone10Patterns.includes(pincodeStr)) {
    return 105;
  }

  // ZONE 11: Bangalore & South India (2300-2500 km)
  const zone11Patterns = ['560', '561', '562', '563', '564', '565', '566', '567', '568', '569', '570'];
  if (zone11Patterns.includes(pincodeStr)) {
    return 120;
  }

  // ZONE 12: Remote areas - Himachal Pradesh (1900 km)
  const zone12Patterns = ['170', '171', '172', '173', '174', '175', '176', '177', '178', '179'];
  if (zone12Patterns.includes(pincodeStr)) {
    return 130;
  }

  // DEFAULT: Rest of India (1500-2000 km average)
  return 90;
};

module.exports = {
  checkServiceability,
  calculateShippingCharges,
  getShippingCost,
  validatePincode,
};
