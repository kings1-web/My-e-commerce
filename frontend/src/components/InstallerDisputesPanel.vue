<template>
  <div class="card border-0 shadow-sm rounded-3 bg-white overflow-hidden mt-4">
    <div class="card-header bg-dark text-white py-3 border-0 d-flex justify-content-between align-items-center">
      <h6 class="mb-0 fw-bold d-flex align-items-center gap-2">🔧 Service Marketplace Workspace (Requests & Disputes)</h6>
      <button class="btn btn-xs btn-outline-light font-monospace" @click="fetchActiveInstallerRequests">🔄 Refresh List</button>
    </div>
    
    <div class="table-responsive max-panel-height overflow-auto">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light text-secondary small text-uppercase font-monospace" style="font-size: 0.75rem;">
          <tr>
            <th class="ps-3">Customer / Client</th>
            <th>Assigned Technician</th>
            <th>Installation Address</th>
            <th>Job Progress Status</th>
            <th>Escrow Fee</th>
            <th class="text-center" style="width: 150px;">Dispute Node</th>
            <th class="pe-3 text-end" style="width: 180px;">Administrative Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- EMPTY STATE FALLBACK -->
          <tr v-if="allRequests.length === 0">
            <td colspan="7" class="text-center text-muted py-5 bg-light-subtle small italic">
              No active installation requests or escrow milestones currently recorded on the platform network.
            </td>
          </tr>

          <!-- MAIN ITERATION LOOP (REQUESTS MODEL FIELD MAPPING) -->
          <tr v-for="req in allRequests" :key="req._id || req.id" class="transition-hover">
            <!-- 1. CUSTOMER IDENTITY -->
            <td class="ps-3">
              <strong class="text-dark small d-block">{{ req.user?.name || 'N/A' }}</strong>
              <small class="text-muted font-monospace d-block" style="font-size: 0.72rem;">{{ req.user?.email || 'No email' }}</small>
            </td>

            <!-- 2. TECHNICIAN IDENTITY -->
            <td>
              <strong class="text-secondary small d-block">{{ req.installer?.name || 'Unassigned' }}</strong>
              <small class="text-muted font-monospace d-block" style="font-size: 0.72rem;">{{ req.installer?.location || 'Global' }}</small>
            </td>

            <!-- 3. INSTALLATION SITE LOCATION -->
            <td>
              <span class="text-muted small text-truncate d-block" style="max-width: 160px;" :title="req.address">
                {{ req.address }}
              </span>
            </td>

            <!-- 4. JOB LIFECYCLE BADGES -->
            <td>
              <span :class="getMilestoneBadgeClass(req.status)">{{ req.status }}</span>
            </td>

            <!-- 5. ESCROW VALUE CASH FLOW -->
            <td>
              <span class="fw-bold text-dark font-monospace small">
                ₦{{ req.priceQuote ? req.priceQuote.toLocaleString() : '0' }}
              </span>
            </td>

            <!-- 6. DISPUTE NODE: ARBITRATION OVERLAYS (Maps to openDispute, viewDispute, resolveDispute) -->
            <td class="text-center">
              <!-- Case A: A Dispute is Open & Locking the contract -->
              <div v-if="req.status === 'disputed' || req.dispute?.isOpen">
                <span class="badge bg-danger text-white text-uppercase font-monospace d-block mb-1" style="font-size:0.65rem;">Disputed</span>
                <div class="d-flex flex-column gap-1">
                  <button class="btn btn-xs btn-info text-white text-center py-0.5" style="font-size:0.68rem;" @click="viewDisputeReason(req)">👁️ View Case</button>
                  <button class="btn btn-xs btn-success text-center py-0.5" style="font-size:0.68rem;" @click="arbitrateInstallerJob(req, 'release')">🤝 Force Pay</button>
                  <button class="btn btn-xs btn-outline-danger bg-white text-center py-0.5" style="font-size:0.68rem;" @click="arbitrateInstallerJob(req, 'refund')">⏪ Force Refund</button>
                </div>
              </div>
              
              <!-- Case B: Regular flow, but admin can open a dispute manually if required -->
              <div v-else>
                <small class="text-muted d-block mb-1" style="font-size:0.75rem;">Clear Escrow</small>
                <!-- Only allow dispute opening if the customer has funded the money and it's in progress -->
                <button 
                  v-if="['funded', 'in_progress', 'completed'].includes(req.status)"
                  class="btn btn-xs btn-outline-warning w-100 py-0.5" 
                  style="font-size:0.68rem;" 
                  @click="openDisputeManually(req)"
                >
                  ⚠️ File Claim
                </button>
                <span v-else class="text-muted small text-italic font-monospace text-center" style="font-size:0.7rem;">-</span>
              </div>
            </td>

            <!-- 7. ADMINISTRATIVE ACTIONS: THE REVENUE RELEASE TRIGGERS (NO DISPUTES) -->
            <td class="pe-3 text-end">
              <!-- 🟢 STANDARD ESCROW PAYOUT TRIGGER LINK (NO DISPUTE) -->
              <!-- Automatically unlocks when the technician sets status to 'completed' -->
              <button
                v-if="req.status === 'completed' && !req.dispute?.isOpen"
                class="btn btn-xs btn-success font-monospace fw-bold px-3 shadow-sm rounded-pill"
                @click="releaseStandardPayout(req._id || req.id)"
              >
                💸 Pay Installer
              </button>

              <!-- State indicators so the Admin knows what is missing from checkout -->
              <span v-else-if="req.status === 'pending'" class="text-muted small text-italic font-monospace" style="font-size:0.7rem;">Awaiting Acceptance</span>
              <span v-else-if="req.status === 'accepted'" class="text-muted small text-italic font-monospace" style="font-size:0.7rem;">Awaiting Price Quote</span>
              <span v-else-if="req.status === 'quoted'" class="text-muted small text-italic font-monospace" style="font-size:0.7rem;">Awaiting Customer checkout</span>
              <span v-else-if="req.status === 'funded'" class="text-primary small fw-semibold font-monospace" style="font-size:0.75rem;">🔒 Escrow Locked</span>
              <span v-else-if="req.status === 'in_progress'" class="text-warning-emphasis small fw-semibold font-monospace" style="font-size:0.75rem;">🚀 Work In Progress</span>
              <span v-else-if="req.status === 'released'" class="text-success small fw-bold font-monospace" style="font-size:0.75rem;">Settled ✔</span>
              <span v-else-if="req.status === 'disputed'" class="text-danger small fw-bold font-monospace" style="font-size:0.75rem;">Arbitration Queue ⚖</span>
              <span v-else class="text-muted small font-monospace">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "InstallerDisputesPanel",
  props: {
    baseURL: { type: String, required: true }
  },
  data() {
    return {
      allRequests: [] // 🟢 Reactive local array stores all installer requests & milestones safely
    };
  },
  mounted() {
    this.fetchActiveInstallerRequests(); 
  },
  methods: {
    // =========================================================================
    // 🟢 FETCH ALL ACTIVE SERVICE AND INSTALLER SYSTEM JOBS (SERVICE MARKETPLACE ONLY)
    // =========================================================================
    async fetchActiveInstallerRequests() {
      try {
        const token = localStorage.getItem("token");
        
        // This endpoint hits your Requests router node to fetch all service requests
        // Note: For best results, use your general GET / requests path that lists items for administrators
        const res = await axios.get(`${this.baseURL}requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.allRequests = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Failed loading service requests database records:", err);
        this.allRequests = [];
      }
    },

        // =========================================================================
    // 💸 1. RELEASE STANDARD PAYOUT (STANDARD LIFECYCLE ROUTE - NO ACTIVE DISPUTE)
    // =========================================================================
    async releaseStandardPayout(requestId) {
      const confirm = await this.$swal({
        title: "Release Escrow Funds?",
        text: "This will transfer the installation milestone fee from your main business wallet straight to the installer's bank account.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        confirmButtonText: "Yes, release payment",
        cancelButtonText: "Cancel"
      });

      if (!confirm.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");

        this.$swal({
          title: "Processing Paystack Payout",
          text: "Executing secure outbound balance transfer...",
          allowOutsideClick: false,
          didOpen: () => { this.$swal.showLoading(); }
        });

        // 🟢 FIXED: Swapped to axios.put and changed path string endpoint to target /release
        await axios.put(
          `${this.baseURL}requests/${requestId}/release`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.$swal("Transfer Dispatched! 💸", "Technician bank account credited successfully.", "success");
        
        // Instantly reload your datatable rows reactively to change badge from 'completed' to 'released'
        await this.fetchActiveInstallerRequests(); 

      } catch (err) {

         // 🟢 CRITICAL REPAIR: Ensures a response is forced back to Vue under ALL network drop circumstances
    console.error("❌ RELEASE OPERATION EXECUTION CRASH:", err.response?.data || err.message);
    
    // Check if Paystack returned an explicit error object reason (e.g. "Insufficient Funds")
    const errorPayload = err.response?.data?.message || err.message;
    
    // Bypasses the hung socket state by terminating the connection request immediately
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Paystack gateway connection error. Transfer aborted.",
        error: errorPayload
      });
    }

        this.$swal(
          "Payout Failed", 
          err.response?.data?.message || "Verify your wallet balance limits or installer bank profile configurations.", 
          "error"
        );
      }
    },


    // =========================================================================
    // ⚠️ 2. OPEN A DISPUTE MANUALLY (ADMIN ACTION)
    // =========================================================================
    async openDisputeManually(requestItem) {
      const { value: reason } = await this.$swal({
        title: "Log Contract Dispute Case",
        input: "text",
        inputPlaceholder: "Explain what went wrong with the installation...",
        inputValidator: (value) => { if (!value) return "You must enter a reason to lock escrow!"; },
        showCancelButton: true,
      });

      if (!reason) return;

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${this.baseURL}requests/${requestItem._id}/dispute`,
          { reason: reason.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.$swal("Dispute Logged", "Project locked under status 'disputed'. Work dashboard assets frozen.", "success");
        await this.fetchActiveInstallerRequests();

      } catch (err) {
        this.$swal("Filing Error", err.response?.data?.message || "Could not save claim.", "error");
      }
    },

    // =========================================================================
    // 👁️ 3. VIEW DISPUTE CLAIM DETAILS
    // =========================================================================
    viewDisputeReason(requestItem) {
      this.$swal({
        title: "🔒 Active Dispute Audit Details",
        html: `<div class="text-start p-2 bg-light font-monospace rounded small">
                 <strong>Filed Reason:</strong><br/> ${requestItem.dispute?.reason || 'No written claim data cached.'}
               </div>`,
        icon: "error"
      });
    },

    // =========================================================================
    // ⚖️ 4. ARBITRATE DISPUTES: BYPASS STANDARD LIFECYCLE (FORCE REVERSAL / FORCE RELEASE)
    // =========================================================================
    async arbitrateInstallerJob(requestItem, action) {
      const isRelease = action === 'release';
      
      const confirmation = await this.$swal({
        title: isRelease ? "Force Arbitration Release?" : "Force Arbitration Refund Reversal?",
        text: isRelease 
          ? `Bypass the claim case lock and forcefully disburse ₦${requestItem.priceQuote?.toLocaleString()} straight to the technician's bank.`
          : `Initiate a transaction reversal request on Paystack nodes to return ₦${requestItem.priceQuote?.toLocaleString()} back to the client's card.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: isRelease ? "#198754" : "#dc3545",
        confirmButtonText: isRelease ? "Yes, pay installer" : "Yes, refund user",
        cancelButtonText: "Cancel Arbitration Override"
      });

      if (!confirmation.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        
        this.$swal({
          title: "Executing Arbitration Decision",
          text: "Communicating authorization state changes with Paystack infrastructure...",
          allowOutsideClick: false,
          didOpen: () => { this.$swal.showLoading(); }
        });

        // Hits your backend requests router resolve-dispute endpoint parameter path
        await axios.put(
          `${this.baseURL}requests/${requestItem._id}/resolve-dispute`,
          { action }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.$swal("Arbitration Complete! ⚖️", "The escrow pipeline records have been synchronized.", "success");
        await this.fetchActiveInstallerRequests(); 

      } catch (err) {
        console.error("Arbitration handshake failed:", err);
        this.$swal("Arbitration Fault Blocked", err.response?.data?.message || "Secure settlement instruction rejected by gateway nodes.", "error");
      }
    },

    // Dynamic utility style class generator handles badge styles cleanly
    getMilestoneBadgeClass(status) {
      const base = "badge px-2.5 py-1 text-uppercase font-monospace rounded-pill ";
      if (status === "released" || status === "completed")
        return base + "bg-success-subtle text-success border border-success-subtle";
      if (status === "funded")
        return base + "bg-primary-subtle text-primary border border-primary-subtle";
      if (status === "in_progress")
        return base + "bg-warning-subtle text-warning border border-warning";
      if (status === "quoted")
        return base + "bg-info-subtle text-info-emphasis border border-info-subtle";
      if (status === "disputed")
        return base + "bg-danger text-white";
      return base + "bg-secondary-subtle text-muted";
    }
  }
};
</script>

<style scoped>
.max-panel-height { max-height: 500px; }
.shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.btn-xs { padding: 0.2rem 0.5rem; font-size: 0.72rem; border-radius: 4px; }
.transition-hover { transition: background 0.15s ease-in-out; }
.transition-hover:hover { background-color: #fafafa !important; }
</style>



