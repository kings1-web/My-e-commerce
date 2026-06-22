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

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow your Vue Dev server URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 60000, // Wait 60 seconds before closing an inactive connection
  pingInterval: 25000 // Send heartbeats every 25 seconds to keep connection alive
});

// Destructure authJwt correctly if it's exported as an object from your jwt.js file
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
const installerReviewsRouter=require("./routers/installerReviews")
const messagesRouter = require("./routers/messages")

const api = process.env.API_URL;

// Global Setup Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// ✅ FIX: Activate the JWT token checking middleware globally here
app.use(authJwt());

// Routers (Now automatically protected by JWT rules configured in your helper)
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/installers`, installersRouter);
app.use(`${api}/requests`, requestsRouter);
app.use(`${api}/reviews`, reviewsRouter);
app.use(`${api}/installer-reviews`, installerReviewsRouter);
app.use(`${api}/messages`, messagesRouter);
// Routes Registry
//app.use("/api/v1/Requests", require("./routers/Requests"));
//app.use("/api/v1/messages", require("./routers/messages"));

// 🟢 STEP 2: REAL-TIME SOCKET CONNECTION PIPELINE
io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Socket server: ${socket.id}`);

  // Listener A: When a user enters the workspace chat view, join an isolated room
  socket.on("join_room", (requestId) => {
    socket.join(requestId);
    console.log(`📁 User joined secure room ID: ${requestId}`);
  });

  // Listener B: Handle real-time text-only messages sent directly over sockets
  socket.on("send_message", async (messageData) => {
    try {
      const { requestId, senderId, senderModel, messageText } = messageData;

      // 1. Save plain-text messages instantly to MongoDB
      // (For file attachments, your router handles the save, so this only processes pure text)
      if (!messageData._id) {
        const newMessage = new Message({
          requestId,
          senderId,
          senderModel,
          messageText
        });
        const savedMessage = await newMessage.save();
        
        // Use the freshly saved document data containing Mongoose timestamps
        messageData = savedMessage.toObject();
      }

      // 2. Broadcast the message packet to the other participant in the room
      socket.to(requestId).emit("receive_message", messageData);

    } catch (err) {
      console.error("❌ Socket message processing crash:", err.message);
      socket.emit("socket_error", { message: "Failed to securely process your message text over websocket." });
    }
  });

  // Listener C: Handle explicit room disconnect sequences gracefully
  socket.on("leave_room", (requestId) => {
    socket.leave(requestId);
    console.log(`🚪 User left room ID: ${requestId}`);
  });

  // Listener D: Handle unexpected disconnections (browser crashes, network drops)
  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client disconnected (${socket.id}). Reason: ${reason}`);
  });
});



// Frontend SPA Fallback handling
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Global Error Handler Middleware
app.use(errorHandler);

const mongoURI = process.env.BASE_URL || "mongodb://localhost:27017/ecommerce";
const PORT = process.env.PORT || 3000;

// Database Connection
mongoose
  .connect(process.env.BASE_URL)
  .then(() => {
    console.log("Database connection is ready...");
    // 💡 IMPORTANT FIX: Must use server.listen instead of app.listen!
    server.listen(PORT, () => {
      console.log(`⚡ Full-Stack Gateway Running cleanly on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

 



/*app.listen(port, () => {
  console.log("Server is running on port " + port);
});*/

