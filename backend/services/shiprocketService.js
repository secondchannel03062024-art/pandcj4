// Shiprocket Integration Service
// Calculates shipping charges based on origin and destination pincode

const axios = require('axios');

// Shiprocket API Configuration
const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_API_KEY = process.env.SHIPROCKET_API_KEY;
const SHIPROCKET_CHANNEL_ID = process.env.SHIPROCKET_CHANNEL_ID;

// Warehouse/Origin details
const ORIGIN_PINCODE = process.env.ORIGIN_PINCODE || '400001'; // Default: Mumbai

/**
 * Check if shipment is serviceable to a pincode
 * @param {string} destinationPincode - Customer's pincode
 * @param {number} weight - Package weight in kg (default: 1)
 * @returns {Promise<Object>} - Serviceability data
 */
async function checkServiceability(destinationPincode, weight = 1) {
  try {
    if (!SHIPROCKET_API_KEY) {
      throw new Error('Shiprocket API key not configured');
    }

    const response = await axios.post(
      `${SHIPROCKET_API_BASE}/courier/serviceability/`,
      {
        pickup_postcode: ORIGIN_PINCODE,
        delivery_postcode: destinationPincode,
        weight: weight,
        cod: 1, // Cash on delivery available
      },
      {
        headers: {
          'Authorization': `Bearer ${SHIPROCKET_API_KEY}`,
        },
      }
    );

    if (response.data.status_code === 200) {
      return {
        serviceable: true,
        data: response.data.data,
        couriers: response.data.data.available_courier_companies || [],
      };
    } else {
      return {
        serviceable: false,
        message: response.data.message || 'Location not serviceable',
      };
    }
  } catch (error) {
    console.error('Shiprocket serviceability check error:', error.message);
    throw error;
  }
}

/**
 * Calculate shipping charges for an order
 * @param {string} destinationPincode - Customer's pincode
 * @param {number} weight - Package weight in kg
 * @param {number} amount - Order amount (for COD)
 * @returns {Promise<Object>} - Shipping charges by courier
 */
async function calculateShippingCharges(destinationPincode, weight = 1, amount = 0) {
  try {
    // Check serviceability first
    const serviceability = await checkServiceability(destinationPincode, weight);

    if (!serviceability.serviceable) {
      return {
        available: false,
        message: serviceability.message,
      };
    }

    const couriers = serviceability.couriers;

    if (!couriers || couriers.length === 0) {
      return {
        available: false,
        message: 'No couriers available for this location',
      };
    }

    // Extract charges from available couriers
    const shippingOptions = couriers.map(courier => ({
      name: courier.name,
      id: courier.id,
      deliveryDays: courier.estimated_delivery_days,
      rate: courier.rate || 0,
      codCharge: courier.cod_charges || 0,
      express: courier.is_express_available || false,
    }));

    // Sort by rate (cheapest first)
    shippingOptions.sort((a, b) => a.rate - b.rate);

    return {
      available: true,
      destinationPincode,
      weight,
      shippingOptions,
      recommendedOption: shippingOptions[0], // Cheapest option
    };
  } catch (error) {
    console.error('Shiprocket shipping calculation error:', error.message);
    throw error;
  }
}

/**
 * Get shipping charges for checkout
 * Simple wrapper that returns cheapest option
 * @param {string} destinationPincode - Customer's pincode
 * @param {number} weight - Package weight in kg (default: 1)
 * @returns {Promise<Object>} - Shipping rate and details
 */
async function getShippingCost(destinationPincode, weight = 1) {
  try {
    const result = await calculateShippingCharges(destinationPincode, weight);

    if (!result.available) {
      return {
        available: false,
        cost: null,
        message: result.message,
        error: 'Shipping not available',
      };
    }

    const cheapestOption = result.recommendedOption;

    return {
      available: true,
      cost: cheapestOption.rate,
      courier: cheapestOption.name,
      courierName: cheapestOption.name,
      deliveryDays: cheapestOption.deliveryDays,
      codCharge: cheapestOption.codCharge,
      allOptions: result.shippingOptions,
      message: `Shipping: ₹${cheapestOption.rate} - Delivery in ${cheapestOption.deliveryDays} days`,
    };
  } catch (error) {
    // Return error response instead of throwing
    return {
      available: false,
      cost: null,
      error: error.message || 'Failed to calculate shipping',
      fallbackCost: 100, // Fallback to default if API fails
    };
  }
}

/**
 * Validate pincode format
 * @param {string} pincode - Pincode to validate
 * @returns {boolean}
 */
function validatePincode(pincode) {
  // Indian pincode: 6 digits
  return /^\d{6}$/.test(pincode);
}

module.exports = {
  checkServiceability,
  calculateShippingCharges,
  getShippingCost,
  validatePincode,
};
