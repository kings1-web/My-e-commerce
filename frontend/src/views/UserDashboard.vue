<template>
  <div class="container mt-5">
    <!-- Dashboard Welcoming Banner Header -->
    <div class="row mb-4 align-items-center pb-3 border-bottom" v-if="authStore.token">
      <div class="col">
        <h3 class="fw-bold text-dark mb-1">Welcome Back, {{  authStore.user?.email || 'Customer'  }}!</h3>
        <p class="text-muted mb-0 small">Manage your purchased hardware installation requests and secure milestones safely.</p>
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
        <h5 class="mb-0 card-title fw-bold" style="font-size: 1rem;">🛡️ Your Active Setup Contracts</h5>
      </div>
      
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-secondary uppercase small" style="font-size: 0.8rem;">
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
              <td colspan="5" class="text-center text-muted py-5 italic bg-light-subtle">
                <span class="fs-2 mb-2 d-block">📦</span>
                You haven't initiated any professional installation requests yet.<br>
                <router-link to="/installers" class="btn btn-primary btn-sm mt-3 fw-bold">Browse Certified Installers</router-link>
              </td>
            </tr>

            <!-- Table Loop Row Record Parameters Mapping -->
            <tr v-for="job in activeContracts" :key="job._id">
              <td class="ps-4">
                <div class="d-flex align-items-center gap-2">
                  <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold small shadow-xs" style="width: 32px; height: 32px;">
                    {{ job.installer?.name?.charAt(0).toUpperCase() }}
                  </div>
                  <strong class="text-dark small">{{ job.installer?.name || "Assigned Technician" }}</strong>
                </div>
              </td>
              <td>
                <span class="text-secondary small fw-medium d-block text-truncate" style="max-width: 180px;">
                  {{ job.product?.name || "General Setup Inquiry" }}
                </span>
              </td>
              <td>
                <span class="text-muted small text-truncate d-block" style="max-width: 200px;" :title="job.address">
                  {{ job.address }}
                </span>
              </td>
              <td class="text-center">
                <!-- Color coded milestones tracking status tags -->
                <span :class="getMilestoneBadgeClass(job.status)">{{ job.status }}</span>
                <small v-if="job.priceQuote > 0" class="d-block text-success fw-bold mt-1" style="font-size: 0.75rem;">
                  ₦{{ job.priceQuote.toLocaleString() }}
                </small>
              </td>
              <td class="text-center pe-4">
                <!-- 🚀 MASTER ACTION BUTTON PATHWAY LINK PORTALS -->
                <RouterLink
                  :to="{ name: 'WorkspaceChat', params: { requestId: job._id || job.id } }"
                  class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 transition-hover"
                >
                  💬 Open Workspace
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
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
    baseURL: { type: String, required: true }
  },
  data() {
    return {
      authStore: useAuthStore(),
      //baseURL: "http://localhost:3000/api/v1/",
      activeContracts: [],
      isLoading: true
    };
  },
  async mounted() {
    // 🔐 Safety authentication guard bounce layer limits page entry
    if (!this.authStore.token) {
      this.$swal({ text: "Please sign in to access your dashboard overview panel.", icon: "warning" });
      this.$router.push("/login");
      return;
    }
    await this.fetchCustomerActiveContracts();
  },
  methods: {
    async fetchCustomerActiveContracts() {
      try {
        const customerId = this.authStore.user?.id || this.authStore.user?._id || this.authStore.userId;
        
        // Hits the specific populated filtering API endpoint we designed for database mappings
        const res = await axios.get(`${this.baseURL}Requests/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` }
        });
        
        this.activeContracts = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Failed to load customer workspace contract entries profiles:", err);
      } finally {
        this.isLoading = false;
      }
    },
    getMilestoneBadgeClass(status) {
      const base = "badge px-3 py-1.5 text-uppercase font-monospace rounded-pill ";
      if (status === 'released' || status === 'completed') return base + "bg-success-subtle text-success border border-success-subtle";
      if (status === 'funded') return base + "bg-primary-subtle text-primary border border-primary-subtle";
      if (status === 'quoted') return base + "bg-info-subtle text-info-emphasis border border-info-subtle";
      return base + "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    },
    formatPrice(value) {
      if (!value) return "₦0";
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
    }
  }
};
</script>

<style scoped>
.shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.italic { font-style: italic; }
.transition-hover { transition: all 0.2s ease; }
.transition-hover:hover { background-color: #0d6efd; color: #fff !important; transform: translateY(-1px); }
</style>
