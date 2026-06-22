const { expressjwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;

  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
       // ✅ ADD THIS: Excludes the approved installers fetch path from token validation checks
      { url: /\/api\/v1\/installers\/approved/, methods: ["GET", "OPTIONS"] }, 
      // 🟢 ADD THIS: Excludes individual dynamic detail paths from the security check
    { url: /\/api\/v1\/installers\/(.*)\/details/, methods: ["GET", "OPTIONS"] }, 
    { url: /\/api\/v1\/installer-reviews\/installer(.*)/, methods: ["GET", "OPTIONS"] },
    // Inside your helpers/jwt.js file under unless.path regex loop configurations:
    { url: /\/api\/v1\/messages\/history\/(.*)/, methods: ["GET", "OPTIONS"] },
     { url: /\/favicon.ico/, methods: ['GET'] },   // ✅ add this

     
    // 🟢 ADD THIS: Excludes public product review lookups from requiring a JWT token
    { url: /\/api\/v1\/reviews\/product\/(.*)/, methods: ["GET", "OPTIONS"] }, 
      `${api}/users/login`,
      `${api}/users/register`,
      // Inside your helpers/jwt.js file, ensure these are added to the unless() array:
      `${api}/installers/login`,
      `${api}/installers/register`,

      `${api}/webhook`,
    ]
  });
}

function isRevoked(req, token) {
  return false; // allow all authenticated users
}

/*function isInstaller(req, res, next) {
  if (req.auth && req.auth.isInstaller) {
    next();
  } else {
    res.status(403).json({ message: "Installers only" });
  }
}

function isAdmin(req, res, next) {
  if (req.auth && req.auth.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admins only" });
  }
}*/

// Inside your helpers/jwt.js file middleware guards
async function isInstaller(req, res, next) {
  // express-jwt unpacks your customized signed properties claims list straight onto req.auth
  if (!req.auth || !req.auth.roles || !req.auth.roles.includes("installer")) {
    return res.status(403).json({ message: "Access Denied: Installer role profile verification credentials missing." });
  }
  next();
}

async function isAdmin(req, res, next) {
  // Backward compatible safety fallback checker looks for both older flags and upgraded array states
  if (!req.auth || (!req.auth.isAdmin && (!req.auth.roles || !req.auth.roles.includes("admin")))) {
    return res.status(403).json({ message: "Access Denied: Administrative authority credentials required." });
  }
  next();
}


module.exports = { authJwt, isInstaller, isAdmin };

