<template>
  <div class="container mt-5">
    <!-- Dashboard Welcoming Banner Header -->
    <div class="row mb-4 align-items-center pb-3 border-bottom" v-if="authStore.token">
      <div class="col">
        <h3 class="fw-bold text-dark mb-1">
          <span class="text-secondary fw-normal">Welcome Back,</span>
          {{ authStore.user?.name || "Customer" }}!
        </h3>
        <p class="text-muted mb-0 small">
          Manage your purchased hardware installation requests and secure milestones safely.
        </p>
      </div>
      <div class="col-auto text-end">
        <span class="badge bg-primary px-3 py-2 text-uppercase font-monospace shadow-xs">
          Buyer Account
        </span>
      </div>
    </div>

    <!-- Main Active Contracts Table Card -->
    <div class="card shadow-sm border-0 bg-white rounded-3">
      <div class="card-header bg-dark text-white py-3">
        <h5 class="mb-0 card-title fw-bold" style="font-size: 1rem">
          🛡️ Your Active Setup Contracts
        </h5>
      </div>

      <div class="table-responsive">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <table v-else class="table table-hover align-middle mb-0">
          <thead class="table-light text-secondary uppercase small" style="font-size: 0.8rem">
            <tr>
              <th class="ps-4">Assigned Technician</th>
              <th>Product / Hardware</th>
              <th>Installation Address</th>
              <th class="text-center">Contract Milestone Status</th>
              <th class="text-center pe-4">Workspace Portals</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty dataset placeholder fallback block boundary -->
            <tr v-if="activeContracts.length === 0">
              <td colspan="5" class="text-center text-muted py-5 text-italic bg-light-subtle">
                <span class="fs-2 mb-2 d-block">📦</span>
                You haven't initiated any professional installation requests yet.<br />
                <router-link to="/installers" class="btn btn-primary btn-sm mt-3 fw-bold">
                  Browse Certified Installers
                </router-link>
              </td>
            </tr>

            <!-- Table Loop Row Record Parameters Mapping -->
            <tr v-for="job in activeContracts" :key="job._id || job.id">
              <td class="ps-4">
                <div class="d-flex align-items-center gap-2">
                  <div
                    class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold small shadow-xs"
                    style="width: 32px; height: 32px"
                  >
                    {{ job.installer?.name?.charAt(0).toUpperCase() || "T" }}
                  </div>
                  <strong class="text-dark small">
                    {{ job.installer?.name || "Assigned Technician" }}
                  </strong>
                </div>
              </td>
              <td>
                <span class="text-secondary small fw-medium d-block text-truncate" style="max-width: 180px">
                  {{ job.product?.name || "General Setup Inquiry" }}
                </span>
              </td>
              <td>
                <span class="text-muted small text-truncate d-block" style="max-width: 200px" :title="job.address">
                  {{ job.address }}
                </span>
              </td>
              <td class="text-center">
                <!-- Color coded milestones tracking status tags -->
                <span :class="getMilestoneBadgeClass(job.status)">{{ job.status }}</span>
                <small v-if="job.priceQuote > 0" class="d-block text-success fw-bold mt-1" style="font-size: 0.75rem">
                  {{ formatPrice(job.priceQuote) }}
                </small>
                
                <!-- 🚨 DISPUTE BADGE -->
                <span v-if="job.dispute && job.dispute.isOpen" class="badge bg-danger text-white mt-1 d-block font-monospace small">
                  Dispute Active
                </span>
              </td>
              <td class="text-center pe-4">
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <!-- MASTER ACTION BUTTON PATHWAY LINK PORTALS -->
                  <RouterLink
                    :to="{ name: 'WorkspaceChat', params: { requestId: job._id || job.id } }"
                    class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 transition-hover"
                    :class="{ 'disabled': job.dispute?.isOpen }"
                  >
                    💬 Open Workspace
                  </RouterLink>

                  <!-- Pay Now Trigger Action Button -->
                  <button
                    v-if="job.status === 'quoted'"
                    :disabled="job.dispute?.isOpen"
                    class="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-xs d-inline-flex align-items-center gap-1"
                    @click="payNow(job)"
                  >
                    💳 Pay Now
                  </button>

                  <!-- Report Problem Trigger Button -->
                  <button
                    v-if="['funded', 'completed'].includes(job.status) && (!job.dispute || !job.dispute.isOpen)"
                    :title="job.dispute?.reason"
                    class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                    @click="openDispute(job)"
                  >
                    ⚠️ Report Problem
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DISPUTE MODAL BACKDROP CONTAINER -->
    <div v-if="showDisputeModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold" style="font-size: 1rem;">⚠️ Report a Contract Issue</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDisputeModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small">Please thoroughly explain what went wrong with your hardware installation project. Support staff will lock changes until resolved.</p>
            <textarea
              v-model="disputeReason"
              class="form-control"
              rows="4"
              placeholder="Explain the service problem here (Minimum 10 characters required)..."
            ></textarea>
          </div>
          <div class="modal-footer bg-light">
            <button class="btn btn-secondary btn-sm px-3 rounded-pill fw-semibold" @click="showDisputeModal = false">
              Cancel
            </button>
            <button
              class="btn btn-danger btn-sm px-3 rounded-pill fw-bold"
              :disabled="loading"
              @click="submitDispute"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ loading ? "Filing Case..." : "File Dispute" }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "UserDashboardView",
  props: {
    baseURL: { type: String, required: true },
  },
  data() {
    return {
      authStore: useAuthStore(),
      activeContracts: [],
      isLoading: true,

      // Dispute Modal Controller State Properties
      showDisputeModal: false,
      disputeReason: "",
      selectedJob: null,
      loading: false
    };
  },
  async mounted() {
    if (!this.authStore.token) {
      this.$swal({
        text: "Please sign in to access your dashboard overview panel.",
        icon: "warning",
      });
      this.$router.push("/login");
      return;
    }
    await this.fetchCustomerActiveContracts();
  },
  methods: {
    openDispute(job) {
      this.selectedJob = job;
      this.disputeReason = ""; // Clear out previous entry states safely
      this.showDisputeModal = true;
    },

    async submitDispute() {
      if (!this.disputeReason || this.disputeReason.trim().length < 5) {
        return this.$swal("Error", "Please enter a valid reason (minimum 5 characters).", "error");
      }

      this.loading = true;

      try {
        // 🟢 FIXED: Added missing forward slash separating the request ID parameter from the dispute route
        const res = await axios.put(
          `${this.baseURL}requests/${this.selectedJob._id}/dispute`,
          { reason: this.disputeReason.trim() },
          {
            headers: {
              Authorization: `Bearer ${this.authStore.token}`
            }
          }
        );

        // Standard response validation boundary check
        if (!res.data.success) throw new Error(res.data.message);

        this.$swal("Success", "Dispute opened successfully. Work dashboard tools locked pending admin review.", "success");

        // Reset tracking states and close the modal layout matrix
        this.showDisputeModal = false;
        this.disputeReason = "";
        this.selectedJob = null;

        // Instantly reload local datasets to reflect status changes across visual badges
        await this.fetchCustomerActiveContracts();

      } catch (err) {
        console.error("Dispute filing fault caught:", err);
        this.$swal("Error", err.response?.data?.message || err.message || "Failed to register support request claim.", "error");
      } finally {
        this.loading = false;
      }
    },

    async payNow(req) {
      // Safety Guard: Halt if pricing quotation is completely empty
      if (!req || !req.priceQuote) {
        return this.$swal({
          title: "Pricing Error",
          text: "No active pricing quotation available for checkout transactions.",
          icon: "error",
        });
      }

      try {
        // Trigger a loading overlay state during the API callback handoff
        this.$swal({
          title: "Connecting Gateway",
          text: "Generating your secure Paystack invoice portal...",
          allowOutsideClick: false,
          didOpen: () => {
            this.$swal.showLoading();
          },
        });

        // Hit your corrected Express payments route cleanly
        const response = await axios.post(
          `${this.baseURL}payments/initialize`,
          {
            email: this.authStore.user?.email || "buyer@example.com",
            amount: req.priceQuote, // Send standard amount. Backend multiplies by 100 to convert to Kobo
            orderId: req._id || req.id, // Passes request orderId hidden inside payment metadata tracking array
          },
          {
            headers: {
              Authorization: `Bearer ${this.authStore.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Redirects customer directly onto Paystack's hosted payment screens
        if (response.data && response.data.authorization_url) {
          window.location.href = response.data.authorization_url;
        } else {
          this.$swal(
            "Gateway Issue",
            "Payment gateway returned an invalid transaction response.",
            "error",
          );
        }
      } catch (err) {
        console.error(
          "Payment initialization error:",
          err.response?.data || err.message,
        );
        this.$swal({
          title: "Payment Blocked",
          text:
            err.response?.data?.message ||
            "Secure payment handshake could not initialize.",
          icon: "error",
        });
      }
    },

    async fetchCustomerActiveContracts() {
      this.isLoading = true;
      try {
        const res = await axios.get(`${this.baseURL}requests/customer`, {
          headers: {
            Authorization: `Bearer ${this.authStore.token}`,
          },
        });
        this.activeContracts = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Failed to load customer workspace:", err);
      } finally {
        this.isLoading = false;
      }
    },

    getMilestoneBadgeClass(status) {
      const base =
        "badge px-3 py-1.5 text-uppercase font-monospace rounded-pill ";
      if (status === "released" || status === "completed" || status === "paid")
        return (
          base + "bg-success-subtle text-success border border-success-subtle"
        );
      if (status === "funded")
        return (
          base + "bg-primary-subtle text-primary border border-primary-subtle"
        );
      if (status === "quoted")
        return (
          base + "bg-info-subtle text-info-emphasis border border-info-subtle"
        );
      return (
        base +
        "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
      );
    },

    formatPrice(value) {
      if (!value) return "₦0";
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(value);
    },
  },
};
</script>

<style scoped>
.shadow-xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.transition-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
</style>
