const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");

// Dotenv configuration initialized immediately
const dotenv = require('dotenv');
dotenv.config();

// =========================================================================
// 🔒 1. COMPLETE PLATFORM CORS CONFIGURATION MATRIX
// =========================================================================
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server requests or matching browser origins cleanly
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS Policy Violation: Origin unauthorized."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Explicitly authorized PUT & OPTIONS parameters
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply comprehensive CORS matrix parameters to Express immediately
app.use(cors(corsOptions));

// 🟢 CRITICAL REPAIR: Intercept all OPTIONS preflight handshakes and return an immediate 204 OK status
// This guarantees the browser clears the preflight check beforehitting the JWT token middleware scanner
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

// Import Message Mongoose Model
const Message = require("./models/message"); 

// Destructure authJwt correctly from helper file
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

// Standard Global Body-Parsing Middleware 
app.use(express.json());
app.use(morgan("tiny"));

app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 🟢 CRITICAL REPAIR: Active the global JWT middleware scanner ONLY for authenticated methods
// Preflight checking operations are explicitly bypassed by the underlying express-jwt library
app.use('/api', authJwt());

// Global Error Handler Middleware (Must come AFTER authJwt/routers to catch failures)
app.use(errorHandler);

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

// Frontend SPA Fallback handling
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const mongoURI = process.env.BASE_URL || "mongodb://localhost:27017/ecommerce";
const PORT = process.env.PORT || 3000;

// Database Connection
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Database connection is ready...");
    server.listen(PORT, () => {
      console.log(`⚡ Full-Stack Gateway Running cleanly on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failure:", err);
  });

