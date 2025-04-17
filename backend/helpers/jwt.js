const {expressjwt} = require('express-jwt'); // Correct import

   function authJwt() {
   const secret = process.env.secret;

  const api = process.env.API_URL;

     return expressjwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked // Ensure 'isRevoked' is properly defined
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["DELETE", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/webhook(.*)/, methods: ["POST", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["POST", "OPTIONS"] },
      `${api}/payment/success`,
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}
  function isRevoked(req,token) {
 return !token.payload.isAdmin;
    
}
 
module.exports = authJwt;

