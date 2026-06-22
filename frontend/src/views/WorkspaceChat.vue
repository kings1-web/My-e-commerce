<template>
  <div class="container my-5">
    <!-- Top Back Navigation Header Button -->
    <div class="mb-4">
      <button class="btn btn-outline-dark btn-sm fw-semibold px-3" @click="$router.back()">
        &larr; Back to Dashboard
      </button>
    </div>

    <!-- Main Workspace Interface Grid Layout -->
    <div class="row g-4" v-if="requestId && currentUserId && requestData">
      
      <!-- Left Grid Column: Contract & Escrow Milestone Management Widget -->
      <div class="col-lg-4">
        <!-- 🟢 Listen for status-updated events from the milestone component to keep data in sync -->
        <ContractMilestone 
          :requestId="requestId" 
          :baseURL="baseURL" 
          @status-updated="handleStatusRefresh" 
        />
      </div>

      <!-- Right Grid Column: Conditional Sockets Messaging Block -->
      <div class="col-lg-8">
        <!-- 🟢 CONDITION A: The installer has officially accepted or quoted the assignment -->
        <ChatBox 
          v-if="isChatActivated"
          :requestId="requestId" 
          :currentUserId="currentUserId" 
          :senderModel="senderModel" 
          :baseURL="baseURL" 
        />

        <!-- 🔴 CONDITION B: The installer hasn't accepted yet (Status is still pending) -->
        <div v-else class="card shadow border-0 h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 bg-white">
          <div class="p-4 bg-light rounded-circle mb-3 shadow-xs text-secondary fs-2">
            🔒
          </div>
          <h5 class="fw-bold text-dark mb-2">Secure Workspace Chat Locked</h5>
          <p class="text-secondary small max-w-400 mb-0">
            For security and verification boundaries, messaging features will unlock as soon as the technician accepts the job application or submits an initial service price quote.
          </p>
        </div>
      </div>
      
    </div>
    
    <!-- Main Full Page Loader Spinner Layout Fallback Element -->
    <div v-else class="text-center py-5 my-5 text-muted">
      <span class="spinner-border text-primary d-block mx-auto mb-3"></span>
      <p class="small">Initializing your protected workspace dashboard data files...</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useInstallerStore } from "@/stores/installer";

import ContractMilestone from "@/components/ContractMilestone.vue";
import ChatBox from "@/components/ChatBox.vue";

export default {
  name: "WorkspaceChatView",
  components: { ContractMilestone, ChatBox },
  props: {
    requestId: { type: String, required: true },
    baseURL: { type: String, required: true }

  },
   
  data() {
    return {
      authStore: useAuthStore(),
      installerStore: useInstallerStore(),
      //baseURL: "http://localhost:3000/api/v1/",
      currentUserId: null,
      senderModel: "",
      requestData: null // 🟢 Local cache state tracks live status attributes
    };
  },
  computed: {
    // 🟢 Dynamic logic boundary locks or unlocks chat interfaces
    isChatActivated() {
      if (!this.requestData) return false;
      // Chat is unlocked for anything EXCEPT the initial "pending" application block
      return this.requestData.status !== "pending";
    },
    activeToken() {
      return this.installerStore.token || this.authStore.token;
    }
  },
  async mounted() {
    this.determineUserIdentityContext();
    await this.fetchLiveRequestStatus();
  },
  methods: {
    determineUserIdentityContext() {
      if (this.installerStore.token) {
        this.currentUserId = this.installerStore.installer?.id || this.installerStore.installer?._id;
        this.senderModel = "Installer";
      } else if (this.authStore.token) {
        this.currentUserId = this.authStore.user?.id || this.authStore.user?._id;
        this.senderModel = "User";
      } else {
        alert("Unauthorized access. Please log in first.");
        this.$router.push("/login");
      }
    },
    // 🟢 Pull current contract request state parameters straight out of MongoDB
    async fetchLiveRequestStatus() {
      try {
        const res = await axios.get(`${this.baseURL}Requests/${this.requestId}`, {
          headers: { Authorization: `Bearer ${this.activeToken}` }
        });
        this.requestData = res.data;
      } catch (err) {
        console.error("Workspace status sync failure:", err);
      }
    },
    // Triggered when subcomponents tell the page that a state transaction occurred
    async handleStatusRefresh() {
      await this.fetchLiveRequestStatus();
    }
  }
};
</script>

<style scoped>
.shadow-xs { box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
.max-w-400 { max-width: 400px; }
</style>
