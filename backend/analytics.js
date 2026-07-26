const axios = require('axios');

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
const GA_API_SECRET = 'your_api_secret_here';

const trackBackendEvent = async (clientId, eventName, eventParams = {}) => {
  const url = `https://google-analytics.com{GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;
  
  try {
    await axios.post(url, {
      client_id: clientId, // Must match frontend client ID to link user sessions
      events: [{
        name: eventName,
        params: eventParams,
      }]
    });
  } catch (error) {
    console.error('GA Tracking Error:', error);
  }
};

module.exports = trackBackendEvent;
