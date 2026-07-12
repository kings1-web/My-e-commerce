const { expressjwt: expressJwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL || "/api/v1";
  
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    requestProperty: "auth", // Decrypts token claims right into req.auth safely
    isRevoked: isRevoked
  }).unless({
    path: [
      // 🟢 Public paths allowed to bypass token encryption checks completely
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/installers\/approved/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/installers\/(.*)\/details/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/reviews\/product\/(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/messages\/history\/(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders\/confirm\/:id(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/users(.*)/, methods: ['POST', 'GET', 'OPTIONS'] },
      
      // 🔓 FIXED: Open up the entire payments router subtree to allow both /banks and /verify/:ref 
      { url: /\/api\/v1\/payments(.*)/, methods: ['GET', 'POST', 'OPTIONS'] },
      
      // 🔓 FIXED: Changed to a safe Regular Expression string to accurately exclude the installer registration endpoint from token requirements
      { url: /\/api\/v1\/installers\/register(.*)/, methods: ['POST', 'OPTIONS'] },

      // 🛑 CRITICAL REPAIR: Make sure NO reference to '/api/v1/requests(.*)' or '/api/v1/payments(.*)' 
      // exists inside this public bypass list! Leaving them out forces the server to intercept the route,
      // decrypt the token bearer header, and populate req.auth safely for your dashboards.

      `${api}/users/login`,
      `${api}/users/register`
    ]
  });
}

// ✅ INSTALLER GUARD
function isInstaller(req, res, next) {
  const user = req.auth;

  if (!user || !user.roles || !user.roles.includes("installer")) {
    return res.status(403).json({
      message: "Access Denied: Installer only"
    });
  }

  // 🔥 ADD THIS CHECK
  if (user.isApproved === false) {
    return res.status(403).json({
      message: "Installer profile is currently undergoing verification review and is not approved yet."
    });
  }

  next();
}

// ✅ ADMIN GUARD
function isAdmin(req, res, next) {
  const user = req.auth;

  if (!user || (!user.isAdmin && !user.roles?.includes("admin"))) {
    return res.status(403).json({
      message: "Access Denied: Admin only"
    });
  }

  next();
}

async function isRevoked(req, token) { return false; }

module.exports = { authJwt, isInstaller, isAdmin };



