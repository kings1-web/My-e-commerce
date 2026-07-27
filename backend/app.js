const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");

const dotenv = require('dotenv');
dotenv.config();

// =========================================================================
// 🔒 1. PLATFORM CORS CONFIGURATION MATRIX
// =========================================================================
const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173",
  "https://shoppersfix.com",
  "https://www.shoppersfix.com" // 👈 Add www variation just in case
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS Policy Violation: Origin unauthorized."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "x-paystack-signature"],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Socket.io Server Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 60000, 
  pingInterval: 25000 
});

const Message = require("./models/message"); 
const { authJwt } = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

// Route imports
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const installersRouter = require("./routers/installers");
const requestsRouter = require("./routers/requests");
const reviewsRouter = require("./routers/reviews");
const installerReviewsRouter = require("./routers/installerReviews");
const messagesRouter = require("./routers/messages");
const paymentsRouter = require("./routers/payments"); 

const api = process.env.API_URL || "/api/v1";

// =========================================================================
// 🟢 FIXED ORDER MIDDLEWARES: Setup Body Parsing & Custom Verifications FIRST
// =========================================================================
app.use(morgan("tiny"));

// Single cohesive body parser setup ensuring raw body is stored before routes read it
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Active the global JWT middleware scanner ONLY for authenticated methods
app.use('/api', authJwt());

// Routers Mappings
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/installers`, installersRouter);
app.use(`${api}/requests`, requestsRouter);
app.use(`${api}/reviews`, reviewsRouter);
app.use(`${api}/installer-reviews`, installerReviewsRouter);
app.use(`${api}/messages`, messagesRouter);
app.use(`${api}/payments`, paymentsRouter); 

// =========================================================================
// 🚀 DYNAMIC XML SITEMAP GENERATOR ENGINE FOR GOOGLE SEARCH CONSOLE
// =========================================================================
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
// Named import matching your schema setup
const { Product } = require("./models/product"); 

app.get('/sitemap.xml', async (req, res) => {
  try {
    res.header('Content-Type', 'application/xml');

    // 1. Establish your public client-facing static storefront URLs
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/installers', changefreq: 'weekly', priority: 0.8 },
      { url: '/become-an-installer', changefreq: 'monthly', priority: 0.6 },
      { url: '/signup', changefreq: 'monthly', priority: 0.5 },
      { url: '/login', changefreq: 'monthly', priority: 0.5 }
    ];

    // 2. Fetch live database products utilizing the _id fields
    const products = await Product.find({}).select('id'); 
    
    products.forEach(product => {
      // MATCHES FRONTEND ROUTE: path:'/product/show/:id'
      links.push({ 
        url: `/product/show/${product.id.toString()}`, 
        changefreq: 'weekly', 
        priority: 0.9 
      });
    });

    // 3. Stream data pipeline directly using your custom verified domain
    const stream = new SitemapStream({ hostname: 'https://shoppersfix.com' });
    const xmlBuffer = await streamToPromise(Readable.from(links).pipe(stream));
    
    return res.send(xmlBuffer.toString());
  } catch (error) {
    console.error("❌ Sitemap Generation Error:", error);
    return res.status(500).end();
  }
});


// SPA Fallback handling
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 🟢 CRITICAL REPAIR: The Error Handler must reside at the very bottom of your application stack
app.use(errorHandler);

// REAL-TIME SOCKET CONNECTION PIPELINE
io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Socket server: ${socket.id}`);

  socket.on("join_room", (requestId) => {
    socket.join(requestId);
    console.log(`📁 User joined secure room ID: ${requestId}`);
  });

  socket.on("send_message", async (messageData) => {
    try {
      const { requestId, senderId, senderModel, messageText } = messageData;

      if (!messageData._id) {
        const newMessage = new Message({
          requestId,
          senderId,
          senderModel,
          messageText
        });
        const savedMessage = await newMessage.save();
        messageData = savedMessage.toObject();
      }

      socket.to(requestId).emit("receive_message", messageData);
    } catch (err) {
      console.error("❌ Socket message processing crash:", err.message);
      socket.emit("socket_error", { message: "Failed to securely process your message text over websocket." });
    }
  });

  socket.on("leave_room", (requestId) => {
    socket.leave(requestId);
    console.log(`🚪 User left room ID: ${requestId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client disconnected (${socket.id}). Reason: ${reason}`);
  });
});

const mongoURI = process.env.BASE_URL || "mongodb://localhost:27017/ecommerce";
const PORT = process.env.PORT || 3000;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Database connection is ready...");
    server.listen(PORT, () => {
      console.log(`⚡ Full-Stack Gateway Running cleanly on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failure:", err);
  });