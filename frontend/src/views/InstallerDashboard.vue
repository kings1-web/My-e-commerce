<template>
  <div class="container mt-4">
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h3>Installer Dashboard</h3>
      </div>

      <!-- Profile Widget Section -->
      <div class="col-auto text-end" v-if="store.installer">
        <div class="d-flex align-items-center gap-3">
          <!-- Profile Image Widget -->
          <div class="position-relative">
            <img
              :src="imagePreview || store.installer.images || '/default-avatar.png'"
              alt="Profile Pic"
              class="rounded-circle border img-thumbnail object-fit-cover"
              style="width: 65px; height: 65px; object-fit: cover"
            />
            <input
              type="file"
              ref="fileInput"
              @change="onFileSelected"
              accept="image/*"
              class="d-none"
            />
          </div>

          <!-- Text Details & Action Buttons -->
          <div class="text-start">
            <h6 class="mb-0 fw-bold">{{ store.installer.name }}</h6>
            <div class="d-flex gap-2 mt-1">
              <button
                @click="triggerFileSelect"
                class="btn btn-link p-0 text-decoration-none small text-primary"
                :disabled="isUploading"
              >
                {{ isUploading ? "Uploading..." : "Change Photo" }}
              </button>
              <span class="text-muted small">|</span>
              <button
                type="button"
                class="btn btn-link p-0 text-decoration-none small text-danger fw-semibold"
                data-bs-toggle="modal"
                data-bs-target="#logoutModal"
              >
                Logout
              </button>

              <!-- Bootstrap Logout Confirmation Modal -->
              <div
                class="modal fade"
                id="logoutModal"
                tabindex="-1"
                aria-labelledby="logoutModalLabel"
                aria-hidden="true"
                ref="logoutModalElement"
              >
                <div class="modal-dialog modal-dialog-centered">
                  <div class="modal-content shadow border-0">
                    <div class="modal-header bg-danger text-white">
                      <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
                      <button
                        type="button"
                        class="btn-close btn-close-white"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div class="modal-body py-4 text-center">
                      <p class="fs-5 mb-0" style="color: #333">
                        Are you sure you want to log out of your dashboard account?
                      </p>
                    </div>
                    <div class="modal-footer bg-light justify-content-center">
                      <button
                        type="button"
                        class="btn btn-secondary px-4"
                        data-bs-dismiss="modal"
                        ref="closeModalBtn"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        class="btn btn-danger px-4"
                        @click="confirmLogout"
                      >
                        Yes, Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Incoming Requests Table Segment -->
    <div class="card shadow-sm mt-3">
      <div class="card-header bg-light">
        <h5 class="mb-0 card-title text-dark">Assigned Installation Requests</h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>User Name</th>
              <th>Product</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.requests.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                No validation requests available.
              </td>
            </tr>
            <tr v-for="req in store.requests" :key="req._id">
              <td>{{ req.user?.name || "N/A" }}</td>
              <td>{{ req.product?.name || "N/A" }}</td>
              <td>{{ req.address }}</td>
              <td>
                <span :class="getStatusBadgeClass(req.status)">{{ req.status }}</span>
                <span v-if="req.priceQuote && req.status === 'quoted'" class="d-block text-muted small mt-1">
                  Quoted: ₦{{ req.priceQuote.toLocaleString() }}
                </span>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <!-- 🟢 UPWORK WORKFLOW: If job is brand new pending, installer inputs their negotiation price quote -->
                  <div v-if="req.status === 'pending'" class="input-group input-group-sm" style="max-width: 220px;">
                    <span class="input-group-text bg-light">₦</span>
                    <input 
                      type="number" 
                      class="form-control form-control-sm" 
                      placeholder="Enter Quote Amount"
                      v-model.number="quotes[req._id]"
                      :min="1000"
                    />
                    <button 
                      @click="sendPriceQuote(req._id)" 
                      class="btn btn-primary btn-sm fw-bold"
                      :disabled="!quotes[req._id]"
                    >
                      Submit
                    </button>
                  </div>

                  <!-- 🔵 CHAT ACCESS ACTION: Always available once a job is initiated -->
                  <RouterLink
                    :to="{ name: 'WorkspaceChat', params: { requestId: req._id } }"
                    class="btn btn-outline-primary btn-sm rounded fw-semibold d-inline-flex align-items-center gap-1"
                  >
                    💬 Chat Space
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { useInstallerStore } from "@/stores/installer";
import axios from "axios";

export default {
  name: "InstallerDashboard",
  props: {
    baseURL: { type: String, required: true }
  },
  data() {
    return {
      store: useInstallerStore(),
     // baseURL: "http://localhost:3000/api/v1/",
      imagePreview: null,
      isUploading: false,
      // 🟢 ADDED: Tracks price quotes locally for each specific job ID index
      quotes: {} 
    };
  },
  mounted() {
    this.fetchInstallerRequests();
  },
  methods: {
    async fetchInstallerRequests() {
      try {
        await this.store.getRequests(this.baseURL);
      } catch (err) {
        console.error("Dashboard list mount sync failure:", err);
      }
    },

    // 🟢 UPDATED WORKFLOW METHOD: Ships negotiation quote price values directly to backend milestone route
    async sendPriceQuote(requestId) {
      const price = this.quotes[requestId];
      if (!price || price <= 1000) return alert("Please enter a valid price quote above ₦1,000.");

      try {
        await axios.put(
          `${this.baseURL}Requests/${requestId}/quote`,
          { priceQuote: price },
          {
            headers: { Authorization: `Bearer ${this.store.token}` }
          }
        );

        alert("Price quotation submitted successfully! Customer has been notified to fund escrow.");
        delete this.quotes[requestId]; // Clear local memory input key
        this.fetchInstallerRequests(); // Sync UI data instantly
      } catch (err) {
        console.error("Error submitting price quote:", err);
        alert("Failed to submit price quote: " + (err.response?.data?.message || err.message));
      }
    },

    confirmLogout() {
      if (this.$refs.closeModalBtn) {
        this.$refs.closeModalBtn.click();
      }
      this.store.logout();
      this.$router.push("/installer-login");
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    // 🟢 FIXED: Safely repaired and closed your corrupted, cut-off file storage profile image sync pipeline
    async onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.imagePreview = URL.createObjectURL(file);
      this.isUploading = true;

      try {
        await this.store.updateProfileImage(this.baseURL, file);
        alert("Profile image saved directly to Cloudinary!");
      } catch (err) {
        console.error("Profile picture upload failure:", err);
        alert("Failed to update profile picture.");
        this.imagePreview = null; 
      } finally {
        this.isUploading = false;
      }
    },

    getStatusBadgeClass(status) {
      const base = "badge px-3 py-2 text-uppercase font-monospace ";
      if (status === "released" || status === "completed") return base + "bg-success-subtle text-success border border-success-subtle";
      if (status === "funded") return base + "bg-primary-subtle text-primary border border-primary-subtle";
      if (status === "quoted") return base + "bg-info-subtle text-info-emphasis border border-info-subtle";
      return base + "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    }
  }
};
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
</style>
