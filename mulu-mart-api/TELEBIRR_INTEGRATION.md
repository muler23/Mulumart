# Telebirr Real Payment Integration Guide

## 🚀 Overview
This guide covers transitioning from mock payments to real Telebirr integration for Mulu-Mart.

## 📋 Prerequisites

### 1. Telebirr Merchant Account
- **Contact Telebirr Ethiopia** to become a registered merchant:
  - Website: https://www.telebirr.com/
  - Email: support@telebirr.com  
  - Phone: +251 118 (verify current number)
  - Visit their office: Addis Ababa, Bole

### 2. Required Documentation
- Business license
- Commercial registration certificate
- Tax identification number (TIN)
- Bank account details
- ID documents of authorized signatories

### 3. Technical Requirements
- Production server with HTTPS
- Static IP address (recommended)
- SSL certificate
- Webhook endpoint accessibility

## 🔧 Configuration Steps

### 1. Update Environment Variables
```bash
# Replace in .env file:
TELEBIRR_API_KEY=live_xxxxxxxxxxxxxxxxxxxx
TELEBIRR_SECRET_KEY=sec_xxxxxxxxxxxxxxxxxxxx
TELEBIRR_MERCHANT_ID=your_merchant_id
TELEBIRR_BASE_URL=https://api.telebirr.com
TELEBIRR_WEBHOOK_URL=https://your-domain.com/api/v1/payments/webhook/telebirr
```

### 2. API Key Format
- **Test Keys**: Start with `test_`
- **Live Keys**: Start with `live_`
- **Secret Keys**: Start with `sec_`

### 3. Webhook Configuration
- **URL**: Must be publicly accessible
- **Method**: POST requests only
- **Headers**: JSON content type
- **Security**: Signature verification implemented

## 🔄 Payment Flow

### 1. Initiation
```
User Clicks Promote → Frontend calls /payments/initiate → 
Backend calls Telebirr API → Returns payment URL → 
User redirected to Telebirr → User completes payment
```

### 2. Webhook Processing
```
Telebirr sends webhook → Backend verifies signature → 
Updates payment status → Activates promotion → 
Returns 200 response
```

### 3. User Return
```
Telebirr redirects user → /payment/success or /payment/cancel → 
Frontend shows appropriate message → User can view promotions
```

## 🛡️ Security Implementation

### 1. Request Signing
```javascript
// All requests to Telebirr must be signed
generateRequestSignature(payload) {
  const crypto = require('crypto');
  const sortedKeys = Object.keys(payload).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${payload[key]}`)
    .join('&');
  
  return crypto
    .createHmac('sha256', TELEBIRR_SECRET_KEY)
    .update(queryString)
    .digest('hex');
}
```

### 2. Webhook Verification
```javascript
// Verify incoming webhook signatures
verifyWebhook(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', TELEBIRR_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## 🧪 Testing

### 1. Test Environment
- Use test API keys first
- Small amounts (1-10 ETB)
- Test all promotion tiers
- Verify webhook delivery

### 2. Production Checklist
- [ ] Live API keys configured
- [ ] Webhook URL accessible
- [ ] SSL certificate valid
- [ ] Error handling tested
- [ ] Logging enabled
- [ ] Monitoring set up

## 📊 Monitoring & Logging

### 1. Key Metrics
- Payment success rate
- Transaction timing
- Webhook response time
- Error frequency
- Revenue tracking

### 2. Alert Setup
- Payment failures
- Webhook timeouts
- High error rates
- Revenue anomalies

## 🚨 Common Issues

### 1. Signature Mismatch
**Cause**: Incorrect secret key or encoding
**Solution**: Verify secret key and use UTF-8 encoding

### 2. Webhook Not Received
**Cause**: Firewall or URL blocking
**Solution**: Check accessibility and use tools like webhook.site

### 3. Payment Timeouts
**Cause**: Network issues or API limits
**Solution**: Implement retries and timeout handling

## 📞 Support

### Telebirr Support
- **Technical Support**: +251 118
- **Email**: techsupport@telebirr.com
- **Documentation**: https://developers.telebirr.com/docs

### Emergency Contacts
- **Account Manager**: Your assigned representative
- **24/7 Hotline**: +251 9XX (if available)

## 🔗 API Endpoints

### Production URLs
- **Base URL**: https://api.telebirr.com
- **Payment Create**: POST /payment/create
- **Payment Status**: GET /payment/status/{reference}
- **Refund**: POST /payment/refund

### Sandbox URLs
- **Base URL**: https://sandbox-api.telebirr.com
- **Same endpoints as production**

## 💡 Best Practices

1. **Always validate amounts** before sending to API
2. **Store all transaction IDs** for reconciliation
3. **Implement idempotency** to prevent duplicate charges
4. **Use exponential backoff** for failed requests
5. **Log all requests/responses** for debugging
6. **Monitor webhook delivery** status
7. **Test refund flow** before going live
8. **Implement circuit breaker** for API failures

## 🚀 Deployment

1. **Update .env** with live credentials
2. **Restart backend** service
3. **Test payment flow** end-to-end
4. **Monitor first transactions**
5. **Set up alerts** for failures
6. **Document process** for team

---

**Note**: This integration assumes Telebirr API structure. Actual implementation may vary based on Telebirr's official documentation.
