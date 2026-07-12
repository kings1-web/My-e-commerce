const axios = require("axios");

const sendWhatsApp = async (phone, message) => {
  try {
    if (phone.startsWith("0")) {
      phone = "234" + phone.substring(1);
    }

    await axios.post("https://api.ng.termii.com/api/sms/send", {
      to: phone,
      from: "YourStore",
      sms: message,
      type: "plain",
      channel: "whatsapp",
      api_key: process.env.TERMII_API_KEY
    });

    console.log("WhatsApp sent");
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};

module.exports = sendWhatsApp;