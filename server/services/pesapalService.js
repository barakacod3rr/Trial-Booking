const axios = require('axios');
const crypto = require('crypto');

const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://www.pesapal.com/api/PostPesapalDirectOrderV4';
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

// Generate OAuth signature for PesaPal
const generateOAuthSignature = (url, method, params) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0'
  };
  
  // Combine all parameters
  const allParams = { ...oauthParams, ...params };
  
  // Create parameter string
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');
  
  // Create signature base string
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(CONSUMER_SECRET)}&`;
  
  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
  
  return {
    ...oauthParams,
    oauth_signature: signature
  };
};

// Generate PesaPal payment URL
const generatePesapalUrl = async (paymentData) => {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('PesaPal credentials not configured');
  }
  
  const {
    amount,
    description,
    type = 'MERCHANT',
    reference,
    first_name,
    last_name,
    email,
    phonenumber,
    callback_url,
    notification_id,
    currency = 'KES'
  } = paymentData;
  
  // Prepare the post XML data for PesaPal
  const postXML = `<?xml version="1.0" encoding="utf-8"?>
<PesapalDirectOrderInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
Amount="${amount}" 
Description="${description}" 
Type="${type}" 
Reference="${reference}" 
FirstName="${first_name}" 
LastName="${last_name}" 
Email="${email}" 
PhoneNumber="${phonenumber}" 
Currency="${currency}" 
xmlns="http://www.pesapal.com" />`;
  
  const params = {
    pesapal_request_data: postXML,
    pesapal_callback_url: callback_url
  };
  
  try {
    // Generate OAuth signature
    const oauthParams = generateOAuthSignature(PESAPAL_BASE_URL, 'POST', params);
    
    // Create authorization header
    const authParams = Object.keys(oauthParams)
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
    
    const authHeader = `OAuth ${authParams}`;
    
    // Make request to PesaPal
    const response = await axios.post(PESAPAL_BASE_URL, new URLSearchParams(params), {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data && response.data.trim()) {
      return response.data.trim();
    } else {
      throw new Error('Empty response from PesaPal');
    }
    
  } catch (error) {
    console.error('PesaPal API Error:', error.response?.data || error.message);
    throw new Error(`Failed to generate PesaPal URL: ${error.message}`);
  }
};

// Verify payment status with PesaPal
const verifyPayment = async (merchantReference, trackingId) => {
  const verifyUrl = 'https://www.pesapal.com/api/querypaymentstatus';
  
  const params = {
    pesapal_merchant_reference: merchantReference,
    pesapal_transaction_tracking_id: trackingId
  };
  
  try {
    // Generate OAuth signature for verification
    const oauthParams = generateOAuthSignature(verifyUrl, 'POST', params);
    
    // Create authorization header
    const authParams = Object.keys(oauthParams)
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
    
    const authHeader = `OAuth ${authParams}`;
    
    // Make verification request
    const response = await axios.post(verifyUrl, new URLSearchParams(params), {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Parse response - PesaPal returns payment status as text
    const status = response.data.trim();
    console.log(`Payment verification for ${merchantReference}: ${status}`);
    
    return status; // Returns: PENDING, COMPLETED, FAILED, or INVALID
    
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
};

// Get payment details (additional function for comprehensive tracking)
const getPaymentDetails = async (merchantReference, trackingId) => {
  const detailsUrl = 'https://www.pesapal.com/api/querypaymentdetails';
  
  const params = {
    pesapal_merchant_reference: merchantReference,
    pesapal_transaction_tracking_id: trackingId
  };
  
  try {
    const oauthParams = generateOAuthSignature(detailsUrl, 'POST', params);
    
    const authParams = Object.keys(oauthParams)
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
    
    const authHeader = `OAuth ${authParams}`;
    
    const response = await axios.post(detailsUrl, new URLSearchParams(params), {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
    
  } catch (error) {
    console.error('Payment details error:', error.response?.data || error.message);
    throw new Error(`Failed to get payment details: ${error.message}`);
  }
};

module.exports = {
  generatePesapalUrl,
  verifyPayment,
  getPaymentDetails
};