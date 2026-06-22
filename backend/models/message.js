const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  requestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Request", 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "Installer"]
  },
  messageText: { 
    type: String, 
    default: "" 
  },
  attachmentUrl: {
    type: String,
    default: ""
  },
  attachmentPublicId: {
    type: String,
    default: ""
  }
}, { timestamps: true });


messageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

messageSchema.set("toJSON", {
  virtuals: true,
});
exports.messageSchema=messageSchema
exports.Message = mongoose.model("Message", messageSchema);
