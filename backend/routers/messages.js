const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const { v2: cloudinary } = require("cloudinary");
const { Message } = require("../models/message");

const storage = multer.memoryStorage();
const uploadOptions = multer({ storage });

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chat_attachments", transformation: [{ width: 1000, crop: "limit" }] },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// POST Attachment & Save Data
router.post("/upload-attachment", uploadOptions.single("attachment"), async (req, res) => {
  try {
    const { requestId, senderId, senderModel, messageText } = req.body;
    let attachmentUrl = "";
    let attachmentPublicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      attachmentUrl = result.secure_url;
      attachmentPublicId = result.public_id;
    }

    const message = new Message({
      requestId, senderId, senderModel, messageText, attachmentUrl, attachmentPublicId
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Historical Logs
router.get("/history/:requestId", async (req, res) => {
  try {
    const history = await Message.find({ requestId: req.params.requestId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
