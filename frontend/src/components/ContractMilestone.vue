<template>
  <!-- 🟢 FIXED: Guard moved to the root div to prevent 'Cannot read properties of null (reading status)' -->
  <div class="card shadow border-0 mb-4" v-if="requestData">
    <div class="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
      <h6 class="mb-0 fw-bold">💼 Contract Status & Milestone Summary</h6>
      <span :class="getMilestoneBadgeClass(requestData.status)">{{ requestData.status }}</span>
    </div>
    
    <div class="card-body p-4">
      <!-- Overview Meta Rows -->
      <div class="row g-3 text-sm border-bottom pb-3 mb-3 text-secondary">
        <div class="col-sm-6">
          <strong>Site Address:</strong> <span class="text-dark d-block mt-1">{{ requestData.address }}</span>
        </div>
        <div class="col-sm-6 text-sm-end">
          <strong>Escrow Milestone Value:</strong> 
          <h4 class="fw-bold text-success mt-1 mb-0">{{ formatPrice(requestData.priceQuote) }}</h4>
        </div>
      </div>

      <!-- DYNAMIC SCREEN LAYOUT A: FOR THE TECHNICIAN (INSTALLER) -->
      <div v-if="isUserAnInstaller">
        <!-- Step 1: Installer enters their service quote price -->
        <div v-if="requestData.status === 'pending'">
          <label class="form-label small fw-semibold text-muted">Submit Your Service Charge Quote (NGN)</label>
          <div class="input-group">
            <span class="input-group-text bg-light">₦</span>
            <input type="number" v-model.number="localQuotePrice" class="form-control" placeholder="e.g. 25000" :min="1000" />
            <button class="btn btn-primary fw-bold px-4" @click="submitPriceQuote" :disabled="isProcessing || !localQuotePrice">
              Submit Quote
            </button>
          </div>
          <small class="text-muted d-block mt-1">Once submitted, the customer must fund this milestone to secure your service.</small>
        </div>

        <!-- Step 2: Awaiting Customer Funding -->
        <div v-else-if="requestData.status === 'quoted'" class="alert alert-warning py-3 mb-0 text-center">
          <p class="mb-0 fw-semibold">Your quote has been sent! Waiting for the customer to fund the contract escrow milestone.</p>
        </div>

        <!-- Step 3: Job is funded, installer safe to work -->
        <div v-else-if="requestData.status === 'funded'" class="alert alert-success py-3 mb-0 text-center shadow-xs">
          <h6 class="fw-bold text-success mb-1">🎉 Milestone Securely Funded!</h6>
          <p class="small mb-0 text-secondary">The payment is secured on the platform. It is 100% safe to proceed with the physical setup at the site location.</p>
        </div>

        <!-- Step 4: Complete & Dispatched status -->
        <div v-else-if="requestData.status === 'released'" class="alert alert-primary py-3 mb-0 text-center">
          <h6 class="fw-bold text-primary mb-1">💸 Funds Dispatched</h6>
          <p class="small mb-0 text-secondary">The client approved the completion. The funds have been deposited directly into your technician balance wallet!</p>
        </div>
      </div>

      <!-- DYNAMIC SCREEN LAYOUT B: FOR THE CUSTOMER (USER) -->
      <div v-else>
        <!-- Step 1: Waiting for installer to send quote -->
        <div v-if="requestData.status === 'pending'" class="alert alert-light border py-3 mb-0 text-center text-muted">
          <p class="mb-0 small italic">Waiting for the technician to evaluate the scope and provide a service price quote...</p>
        </div>

        <!-- Step 2: Installer submitted quote, Customer funds escrow -->
        <div v-else-if="requestData.status === 'quoted'" class="bg-light p-3 rounded border text-center shadow-xs">
          <p class="mb-3">The technician quoted <strong>{{ formatPrice(requestData.priceQuote) }}</strong> for this installation assignment.</p>
          <button class="btn btn-success px-4 py-2 fw-bold w-100 shadow-xs" @click="fundContractEscrow" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
            Fund Escrow Milestone (Secure Job)
          </button>
          <small class="text-muted d-block mt-2" style="font-size:0.75rem;">Your funds are held safely by our platform and will only be released when the job is done perfectly.</small>
        </div>

        <!-- Step 3: Contract is funded, Customer has release button -->
        <div v-else-if="requestData.status === 'funded'" class="p-3 border border-warning rounded bg-warning bg-opacity-10 text-center">
          <h6 class="fw-bold text-warning-emphasis mb-1">Work In Progress 🔨</h6>
          <p class="small text-secondary mb-3">The installer has been notified that the payment is secured. Once they finish the job perfectly, verify the setup and release their pay below.</p>
          <button class="btn btn-warning w-100 fw-bold shadow-xs py-2 text-dark" @click="releaseEscrowFunds" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
            Approve Completion & Release Funds
          </button>
        </div>

        <!-- Step 4: Finished Contract -->
        <div v-else-if="requestData.status === 'released'" class="alert alert-success py-3 mb-0 text-center">
          <p class="mb-0 fw-bold">Job complete! Payments have been released cleanly to the technician. Thank you for using our platform!</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Loader Fallback Skeleton UI Component Block -->
  <div v-else class="card p-5 text-center text-muted border-0 shadow-sm">
    <div class="spinner-border spinner-border-sm text-secondary mx-auto mb-2"></div>
    <span class="small">Syncing live milestone parameters...</span>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";          // Customer store
import { useInstallerStore } from "@/stores/installer"; // Installer store

export default {
  name: "ContractMilestoneSummary",
  props: {
    requestId: { type: String, required: true },
    baseURL: { type: String, required: true }
  },
  data() {
    return {
      authStore: useAuthStore(),
      installerStore: useInstallerStore(),
      requestData: null,
      localQuotePrice: null,
      isProcessing: false
    };
  },
  computed: {
    // Identifies if the logged-in user is the installer or the client
    isUserAnInstaller() {
      return !!this.installerStore.token; 
    },
    // Safe extraction fallback logic for authorization token passing parameters
    activeToken() {
      return this.installerStore.token || this.authStore.token;
    }
  },
  async mounted() {
    await this.fetchContractDetails();
  },
  methods: {
    // 🟢 FIXED: Lowercase API routes to prevent 404 routing mismatches
    async fetchContractDetails() {
      try {
        const res = await axios.get(`${this.baseURL}requests/${this.requestId}`, {
          headers: { Authorization: `Bearer ${this.activeToken}` }
        });
        this.requestData = res.data;
        if (this.requestData?.priceQuote) {
          this.localQuotePrice = this.requestData.priceQuote;
        }
      } catch (err) {
        console.error("Failed to sync milestone data profile metrics:", err);
      }
    },

    // 1. Installer submits their charge quote
    async submitPriceQuote() {
      if (!this.localQuotePrice || this.localQuotePrice <= 1000) {
        return alert("Please enter a valid price quote above ₦1,000.");
      }
      this.isProcessing = true;
      try {
        await axios.put(`${this.baseURL}requests/${this.requestId}/quote`, {
          priceQuote: this.localQuotePrice
        }, {
          headers: { Authorization: `Bearer ${this.activeToken}` }
        });
        this.$emit("status-updated");
        alert("Your quote has been sent to the customer!");
        await this.fetchContractDetails();
      } catch (err) {
        console.error(err);
        alert("Failed to submit price quote: " + (err.response?.data?.message || err.message));
      } finally {
        this.isProcessing = false;
      }
    },

    // 2. Customer funds the contract milestone via Paystack
    async fundContractEscrow() {
      if (!this.requestData?.priceQuote || this.requestData.priceQuote <= 0) {
        return alert("Cannot fund a milestone without an active price quote amount.");
      }

      this.isProcessing = true;
      // 🟢 FIXED: Create a local scope reference snapshot to prevent Paystack execution crashes
      const self = this;

      try {
        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_fallback_key_here";
        
        // 🟢 FIXED: Added safety fallback mapping to capture inner nested store fields cleanly
        const customerEmail = this.authStore.user?.email || this.authStore.email || "buyer@royalgoods.com";
        const amountInKobo = this.requestData.priceQuote * 100; 

        if (!window.PaystackPop) {
          throw new Error("Paystack SDK not loaded on client viewport script bundles.");
        }

        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: customerEmail,
          amount: amountInKobo,
          currency: "NGN",
          ref: "ESCROW_PAY_" + Math.floor((Math.random() * 1000000000) + 1),
          
          callback: async (response) => {
            try {
              alert("Payment received by Paystack network portal! Securing escrow allocation...");

              // 🟢 FIXED: Target 'self' and use lowercase path structures cleanly
              await axios.post(`${self.baseURL}requests/${self.requestId}/fund`, {
                paymentIntentId: response.reference 
              }, {
                headers: { Authorization: `Bearer ${self.activeToken}` }
              });

              alert("🎉 Milestone Secured! Status updated dynamically across dashboard logs.");
              
              self.$emit("status-updated");
              await self.fetchContractDetails();

            } catch (backendErr) {
              console.error("Backend escrow validation failure:", backendErr);
              alert("Payment went through but server failed to update milestone status. Reference code: " + response.reference);
            } finally {
              self.isProcessing = false;
            }
          },
          onClose: () => {
            self.isProcessing = false;
            alert("Transaction cancelled. Your funds have not been drawn.");
          }
        });

        handler.openIframe();

      } catch (err) {
        console.error("Paystack initialization crash runtime exception logs:", err);
        alert("Could not load Paystack payment systems gateway components.");
        this.isProcessing = false;
      }
    },

    // 3. Customer approves work completion and releases funds
    async releaseEscrowFunds() {
      if (!confirm("Are you completely satisfied with the installation quality? Clicking confirm releases the payment to the technician permanently.")) return;
      this.isProcessing = true;
      try {
        await axios.put(`${this.baseURL}requests/${this.requestId}/release`, {}, {
          headers: { Authorization: `Bearer ${this.activeToken}` }
        });
        
        this.$emit("status-updated");
        alert("Funds released completely! The installer has been credited.");
        await this.fetchContractDetails();
      } catch (err) {
        console.error(err);
        alert("Failed to process escrow release operations.");
      } finally {
        this.isProcessing = false;
      }
    },

    formatPrice(value) {
      if (!value) return "₦0";
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
    },

    getMilestoneBadgeClass(status) {
      const base = "badge uppercase font-monospace ";
      if (status === 'released' || status === 'completed') return base + "bg-success text-white";
      if (status === 'funded') return base + "bg-primary text-white";
      if (status === 'quoted') return base + "bg-info text-dark";
      return base + "bg-warning text-dark";
    }
  }
};
</script>

