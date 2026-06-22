
<template>
  <div class="card chat-wrapper-card shadow-sm border-0 h-100 bg-whatsapp">
    <!-- Header Section -->
    <div class="card-header bg-whatsapp-header text-white py-2 px-3 border-bottom-0 d-flex align-items-center gap-3">
      <div class="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center fw-bold">
        {{ senderModel === 'User' ? '👨‍🔧' : '👤' }}
      </div>
      <div>
        <h6 class="mb-0 fw-bold chat-title-text">Secure Project Workspace</h6>
        <small class="text-success-light fw-medium d-flex align-items-center gap-1">
          <span class="online-indicator-dot"></span> Active Session
        </small>
      </div>
    </div>
    
    <!-- WhatsApp Style Message History Feed Window Panel -->
    <div class="card-body chat-feed-window p-3" ref="chatScrollContainer">
      <div v-if="messages.length === 0" class="d-flex h-100 align-items-center justify-content-center text-center">
        <div class="bg-white rounded-pill px-4 py-2 border shadow-xs">
          <small class="text-muted fw-medium font-monospace">🔒 End-to-end encrypted platform workspace session initiated.</small>
        </div>
      </div>

      <div 
        v-for="msg in messages" 
        :key="msg._id" 
        class="d-flex mb-2" 
        :class="msg.senderId === currentUserId ? 'justify-content-end' : 'justify-content-start'"
      >
        <!-- Message Bubble Container Segment -->
        <div 
          class="chat-bubble position-relative shadow-xs" 
          :class="msg.senderId === currentUserId ? 'bubble-outgoing' : 'bubble-incoming'"
        >
          <!-- Optional Text Message Body Rendering -->
          <p class="mb-0 message-text-node" v-if="msg.messageText">{{ msg.messageText }}</p>
          
          <!-- Image Attachment Rendering -->
          <div v-if="msg.attachmentUrl" class="message-attachment-box" :class="{ 'mt-1': msg.messageText }">
            <img 
              :src="msg.attachmentUrl" 
              class="img-fluid rounded img-preview cursor-pointer shadow-xs border-light-subtle" 
              alt="Attachment" 
              @click="viewFullImage(msg.attachmentUrl)"
            />
          </div>
          
          <!-- Micro Meta Timestamp Tag Element Inside Bubble Boundary -->
          <div class="bubble-meta text-end mt-1">
            <small class="timestamp-text me-1">
              {{ new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
            </small>
            <span v-if="msg.senderId === currentUserId" class="text-primary-light small">✓✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Interface Toolbar Actions Controls Footer Input Bar -->
    <div class="card-footer bg-whatsapp-footer p-2 border-top-0">
      <!-- Media Preview overlay box before issuing posting requests -->
      <div v-if="imagePreview" class="position-relative d-inline-block m-2 border rounded p-1 bg-white shadow-xs animate-fade-in">
        <img :src="imagePreview" class="rounded object-fit-cover" style="width: 50px; height: 50px;"/>
        <button 
          type="button" 
          class="btn-close btn-close-white position-absolute top-0 start-100 translate-middle bg-danger rounded-circle shadow-sm" 
          style="padding: 0.25rem; font-size: 0.5rem;" 
          @click="clearFile"
        ></button>
      </div>

      <div class="d-flex align-items-center gap-2 px-2">
        <!-- Hidden input element container wrapper -->
        <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileChange"/>
        
        <!-- Attachment trigger button layout links -->
        <button 
          class="btn btn-link chat-footer-action-btn p-1 text-muted" 
          type="button" 
          @click="$refs.fileInput.click()" 
          :disabled="isLoading"
          title="Attach Workspace Media Image File"
        >
          <i class="bi bi-paperclip fs-4"></i>
        </button>
        
        <!-- Text entry input controls box element segment layout -->
        <div class="flex-grow-1">
          <input 
            type="text" 
            v-model="textMessage" 
            class="form-control chat-input-field border-0 rounded-pill py-2 px-3 small shadow-none" 
            placeholder="Type your message here..." 
            @keyup.enter="dispatchMessage" 
            :disabled="isLoading"
          />
        </div>
        
        <!-- Dispatch trigger operational action click container button -->
        <button 
          class="btn btn-whatsapp-send rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" 
          type="button" 
          @click="dispatchMessage" 
          :disabled="isLoading || (!textMessage.trim() && !selectedFile)"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm text-white"></span>
          <i v-else class="bi bi-send-fill text-white fs-6 ps-1"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { io } from "socket.io-client";

export default {
  name: "EscrowChatWidget",
  props: ["requestId", "currentUserId", "senderModel", "baseURL"],
  data() {
    return {
      socket: null,
      messages: [],
      textMessage: "",
      selectedFile: null,
      imagePreview: null,
      isLoading: false
    };
  },
  mounted() {
    this.socket = io("http://localhost:3000");
    this.socket.emit("join_room", this.requestId);

    this.socket.on("receive_message", (data) => {
      this.messages.push(data);
      this.scrollToBottom();
    });

    this.fetchChatHistory();
  },
  methods: {
    async fetchChatHistory() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("installerToken");
        if (!token) return;

        const res = await axios.get(`${this.baseURL}messages/history/${this.requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.messages = Array.isArray(res.data) ? res.data : [];
        this.scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { 
          return alert("Max file size allowed is 5MB!"); 
        }
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    clearFile() {
      this.selectedFile = null;
      this.imagePreview = null;
      this.$refs.fileInput.value = "";
    },
    async dispatchMessage() {
      if (!this.textMessage.trim() && !this.selectedFile) return;
      this.isLoading = true;

      try {
        const token = localStorage.getItem("token") || localStorage.getItem("installerToken");
        const formData = new FormData();
        formData.append("requestId", this.requestId);
        formData.append("senderId", this.currentUserId);
        formData.append("senderModel", this.senderModel);
        formData.append("messageText", this.textMessage.trim());
        if (this.selectedFile) formData.append("attachment", this.selectedFile);

        const res = await axios.post(`${this.baseURL}messages/upload-attachment`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        });

        this.socket.emit("send_message", res.data);
        this.messages.push(res.data);
        
        this.textMessage = "";
        this.clearFile();
        this.scrollToBottom();
      } catch (err) {
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatScrollContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },
    viewFullImage(url) { window.open(url, "_blank"); }
  }
};
</script>


<style scoped>
/* 🟢 WHATSAPP SKIN BRAND COLOR SCHEMA PALETTE STYLES */
.bg-whatsapp {
  background-color: #efeae2;
  background-image: url("https://githubusercontent.com"); /* Classic WA tiled background */
  background-repeat: repeat;
  border-radius: 12px !important;
  overflow: hidden;
}

.bg-whatsapp-header {
  background-color: #005e54; /* Clean Deep Teal WA Green */
}

.bg-whatsapp-footer {
  background-color: #f0f2f5;
}

.text-success-light {
  color: #4bed94 !important;
  font-size: 0.75rem;
}

.chat-title-text {
  font-size: 0.95rem;
}

/* AVATAR & METRICS LAYOUT PROPERTIES */
.avatar-placeholder {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.15);
  font-size: 1.2rem;
}

.online-indicator-dot {
  width: 7px;
  height: 7px;
  background-color: #4bed94;
  border-radius: 50%;
  display: inline-block;
}

/* CHAT AREA SCROLL CONTAINER LOGS */
.chat-feed-window {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chat-feed-window::-webkit-scrollbar {
  width: 5px;
}

.chat-feed-window::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

/* 🟢 THE ICONIC WHATSAPP BUBBLE WRAPPERS LAYOUT CSS */
.chat-bubble {
  padding: 8px 12px 6px 12px;
  border-radius: 7.5px;
  max-width: 70%;
  word-wrap: break-word;
}

.bubble-outgoing {
  background-color: #d9fdd3; /* Accurate light green WA incoming color */
  color: #111b21;
  border-top-right-radius: 0;
}

.bubble-incoming {
  background-color: #ffffff; /* Clean pure white */
  color: #111b21;
  border-top-left-radius: 0;
}

.message-text-node {
  font-size: 0.88rem;
  white-space: pre-line;
}

/* MEDIA & IMAGE MANAGEMENT ATTACHMENTS LAYOUT RULES */
.message-attachment-box img {
  max-width: 100%;
  border-radius: 6px;
  display: block;
  transition: opacity 0.2s ease;
}

.message-attachment-box img:hover {
  opacity: 0.95;
}

/* TIMESTAMP SUBTEXTS INSIDE BUBBLE CONTAINER */
.bubble-meta {
  font-size: 0.68rem;
  color: #667781;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 1;
}

.text-primary-light {
  color: #53bdeb !important; /* Iconic WA blue read-checkmark */
  font-weight: bold;
}

/* INTERACTIVE BOTTOM BAR ACTIONS LAYOUT FOOTER CONTROLS */
.chat-input-field {
  background-color: #ffffff;
  color: #111b21;
  font-size: 0.9rem;
}

.chat-footer-action-btn:hover {
  color: #54656f !important;
}

.btn-whatsapp-send {
  width: 38px;
  height: 38px;
  background-color: #00a884; /* Vibrant active accent WA submit button */
  border: none;
  transition: background-color 0.15s ease;
}

.btn-whatsapp-send:hover:not(:disabled) {
  background-color: #008f72;
}

.btn-whatsapp-send:disabled {
  background-color: #a6d9ce;
  cursor: not-allowed;
}

.shadow-xs {
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, .13);
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

