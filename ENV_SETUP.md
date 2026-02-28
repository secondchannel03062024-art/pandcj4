# Environment Configuration Guide

## Setup Instructions

### 1. Create Environment File
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Configure Your Environment Variables

Open `.env` and fill in your actual values:

#### Required for Production:
- `VITE_PAYMENT_GATEWAY_KEY` - Your payment gateway API key (Razorpay/Stripe)
- `VITE_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name for image uploads
- `VITE_EMAIL_SERVICE_API_KEY` - Your email service API key (SendGrid/Mailgun)

#### Optional:
- `VITE_GOOGLE_ANALYTICS_ID` - Google Analytics tracking ID
- `VITE_FACEBOOK_PIXEL_ID` - Facebook Pixel ID for tracking
- Social media URLs
- Business contact information

### 3. Accessing Environment Variables in Code

Import the config utility:
```typescript
import { config } from '../config/env';

// Example usage:
const apiUrl = config.api.url;
const shippingCost = config.shipping.standardCost;
const taxRate = config.tax.rate;
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_APP_NAME` | Application name | "Fabric Store" | No |
| `VITE_APP_URL` | Application URL | "http://localhost:5173" | No |
| `VITE_API_URL` | Backend API URL | "http://localhost:3000/api" | For backend integration |
| `VITE_PAYMENT_GATEWAY_KEY` | Payment gateway public key | - | For payments |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | For image uploads |
| `VITE_FREE_SHIPPING_THRESHOLD` | Free shipping minimum order | 2000 | No |
| `VITE_STANDARD_SHIPPING_COST` | Standard shipping cost | 100 | No |
| `VITE_TAX_RATE` | Tax rate (GST) | 0.18 | No |
| `VITE_CURRENCY_SYMBOL` | Currency symbol | ₹ | No |

## Important Notes

⚠️ **Security Warning:**
- Never commit `.env` file to version control
- Keep your API keys and secrets secure
- Use different keys for development and production
- In Vite, only variables prefixed with `VITE_` are exposed to the client
- Never store sensitive backend secrets in frontend environment variables

## Feature Flags

Enable/disable features using environment variables:
```env
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_CHAT_SUPPORT=false
```

## Development vs Production

### Development:
```env
VITE_DEBUG_MODE=true
VITE_MOCK_PAYMENTS=true
```

### Production:
```env
VITE_DEBUG_MODE=false
VITE_MOCK_PAYMENTS=false
```

## Troubleshooting

### Environment variables not loading?
1. Restart the development server after changing `.env`
2. Make sure variable names start with `VITE_`
3. Check that `.env` file is in the project root

### Variables are undefined?
1. Verify the variable exists in `.env`
2. Use `import.meta.env.VITE_VARIABLE_NAME` to access directly
3. Or use the config utility: `config.section.variable`
