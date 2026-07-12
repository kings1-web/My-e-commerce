<template>
  <div class="container mt-4">
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h3 class="fw-bold text-dark">Installer Dashboard</h3>
      </div>

      <!-- Unified Profile Information Header Widget Section -->
      <div class="col-auto text-end" v-if="authStore.token && authStore.user">
        <div class="d-flex align-items-center gap-3">
          <!-- Profile Image Widget -->
          <div class="position-relative">
            <img
              :src="
                imagePreview || authStore.user.images || '/default-avatar.png'
              "
              alt="Profile Pic"
              class="rounded-circle border img-thumbnail object-fit-cover shadow-sm"
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
            <h6 class="mb-0 fw-bold text-dark">
              {{ authStore.user.name || "Technician" }}
            </h6>

            <!-- Displays installer's operating location dynamically -->
            <small
              v-if="authStore.user.location"
              class="text-muted d-block small mt-0.5"
            >
              <i class="bi bi-geo-alt-fill text-danger me-1"></i
              >{{ authStore.user.location }}
            </small>

            <!-- Renders specializations / skills collections loop badges -->
            <div
              v-if="authStore.user.skills && authStore.user.skills.length"
              class="d-flex flex-wrap gap-1 mt-1"
              style="max-width: 250px"
            >
              <span
                v-for="skill in authStore.user.skills"
                :key="skill"
                class="badge bg-secondary-subtle text-secondary border px-2 py-0.5 rounded-pill"
                style="font-size: 0.68rem"
              >
                {{ skill }}
              </span>
            </div>

            <div class="d-flex gap-2 mt-2 align-items-center">
              <button
                @click="triggerFileSelect"
                class="btn btn-link p-0 text-decoration-none small text-primary fw-medium"
                :disabled="isUploading"
                style="font-size: 0.8rem"
              >
                {{ isUploading ? "Uploading..." : "Change Photo" }}
              </button>
              <span class="text-muted small">|</span>
              <button
                type="button"
                class="btn btn-link p-0 text-decoration-none small text-danger fw-semibold"
                data-bs-toggle="modal"
                data-bs-target="#logoutModal"
                style="font-size: 0.8rem"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Performance Metric Cards Row -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="card in stats" :key="card.title">
        <div class="card shadow-sm p-3 text-center border-0 bg-white">
          <h6 class="text-muted small text-uppercase mb-1 fw-semibold">
            {{ card.title }}
          </h6>
          <h4 class="fw-bold mb-0 text-dark">{{ card.value }}</h4>
        </div>
      </div>
    </div>

    <!-- Incoming Requests Table Segment -->
    <div class="card shadow-sm mt-3 border-0 rounded-3 overflow-hidden">
      <div class="card-header bg-dark text-white py-3">
        <h5 class="mb-0 card-title fw-bold" style="font-size: 1rem">
          🔧 Assigned Installation Requests
        </h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead
            class="table-light text-secondary uppercase small"
            style="font-size: 0.8rem"
          >
            <tr>
              <th class="ps-4">User Name</th>
              <th>Product</th>
              <th>Address</th>
              <th>Status</th>
              <th class="pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!requests || requests.length === 0">
              <td
                colspan="5"
                class="text-center text-muted py-5 text-italic bg-light-subtle"
              >
                No assignment requests available currently.
              </td>
            </tr>
            <tr v-for="req in requests" :key="req._id">
              <td class="ps-4 fw-semibold text-dark">
                {{ req.user?.name || "N/A" }}
              </td>
              <td class="text-secondary small fw-medium">
                {{ req.product?.name || "General Setup Inquiry" }}
              </td>
              <td>
                <span
                  class="text-muted small text-truncate d-block"
                  style="max-width: 220px"
                  :title="req.address"
                >
                  {{ req.address }}
                </span>
              </td>
              <td>
                <!-- Case A: Request is unaccepted and pending -->
                <div v-if="req.status === 'pending'">
                  <button
                    class="btn btn-sm btn-success me-2 fw-bold shadow-xs px-3"
                    @click="accept(req._id)"
                  >
                    Accept
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger fw-medium"
                    @click="reject(req._id)"
                  >
                    Reject
                  </button>
                </div>

                <!-- Case B: Show status badges for accepted negotiation stage -->
                <div v-else>
                  <span :class="getStatusBadgeClass(req.status)">
                    {{ req.status }}
                  </span>
                </div>

                <!-- Always display the quote figure as soon as it gets submitted -->
                <span
                  v-if="req.priceQuote"
                  class="d-block text-success small mt-1 fw-bold"
                >
                  Quoted: ₦{{ req.priceQuote.toLocaleString() }}
                </span>
              </td>

              <td class="pe-4">
                <div class="d-flex align-items-center gap-2">
                  <!-- 🟢 OPEN FOR COMMUNICATION: Workspace Link activates instantly if status is NOT pending -->
                  <RouterLink
                    v-if="req.status !== 'pending'"
                    :to="{
                      name: 'WorkspaceChat',
                      params: { requestId: req._id },
                    }"
                    class="btn btn-sm btn-dark fw-semibold shadow-xs"
                  >
                    Open Workspace Chat 💬
                  </RouterLink>

                  <!-- 🟢 FLEXIBLE INLINE QUOTE: Input displays during 'accepted' stage so they can chat and then quote -->
                  <div
                    v-if="req.status === 'accepted'"
                    class="input-group input-group-sm shadow-xs"
                    style="max-width: 220px"
                  >
                    <span class="input-group-text bg-light text-muted">₦</span>
                    <input
                      type="number"
                      v-model.number="quotes[req._id]"
                      class="form-control animate-fade-in"
                      placeholder="Final Price"
                      :min="1000"
                    />
                    <button
                      class="btn btn-primary fw-bold px-2"
                      type="button"
                      @click="sendPriceQuote(req._id)"
                      :disabled="!quotes[req._id] || quotes[req._id] <= 1000"
                    >
                      Quote
                    </button>
                  </div>

                  <!-- 🟢 STAGE 2: CUSTOMER HAS PAID ESCROW (Status is 'funded') -->
                  <!-- Calls your async startJob(id) method when the technician arrives at the site -->
                  <button
                    v-if="req.status === 'funded'"
                    class="btn btn-sm btn-primary fw-bold px-3 shadow-xs"
                    @click="startJob(req._id)"
                  >
                    🚀 Start Job
                  </button>

                  <!-- 🟢 STAGE 3: EXECUTION PHASE (Status is 'in_progress') -->
                  <!-- Calls your async completeJob(id) method once setup/installation is finalized -->
                  <button
                    v-if="req.status === 'in_progress'"
                    class="btn btn-sm btn-success fw-bold px-3 shadow-xs"
                    @click="completeJob(req._id)"
                  >
                    ✔ Mark As Completed
                  </button>

                  <!-- Fallback Text notice indicators -->
                  <span
                    v-if="req.status === 'pending'"
                    class="text-muted small text-italic"
                  >
                    Accept job to communicate
                  </span>
                  <span
                    v-if="req.status === 'completed'"
                    class="text-success small fw-bold"
                  >
                    Awaiting Admin Release ⏳
                  </span>
                  <span
                    v-if="req.status === 'released'"
                    class="text-muted small text-italic"
                  >
                    Payout Settled 💸
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
              Are you sure you want to sign out of your professional installer
              profile?
            </p>
          </div>
          <div class="modal-footer bg-light">
            <!-- 🟢 FIXED: ref="closeModalBtn" has been added to close the backdrop overlay background cleanly -->
            <button
              type="button"
              class="btn btn-secondary px-4 btn-sm rounded-pill"
              data-bs-dismiss="modal"
              ref="closeModalBtn"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger px-4 btn-sm rounded-pill fw-bold"
              @click="confirmLogout"
            >
              Yes, logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useInstallerStore } from "@/stores/installer";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

export default {
  name: "InstallerDashboard",
  props: {
    baseURL: { type: String, required: true },
  },
  data() {
    return {
      installerStore: useInstallerStore(),
      authStore: useAuthStore(),
      imagePreview: null,
      isUploading: false,
      quotes: {},
      loadingRequests: false,
    };
  },
  computed: {
    // Bridges your store array directly to your clean template table loop mapping
    requests() {
      return this.installerStore.requests || [];
    },
    // Populates the stats metric array loop configuration required by your template layout
    stats() {
      const reqs = this.requests;
      return [
        { title: "Total Requests", value: reqs.length },
        {
          title: "Pending Actions",
          value: reqs.filter((r) => r.status === "pending").length,
        },
        {
          title: "Active Spaces",
          value: reqs.filter((r) =>
            ["accepted", "quoted", "funded", "in_progress"].includes(r.status),
          ).length,
        },
        {
          title: "Completed Jobs",
          value: reqs.filter(
            (r) => r.status === "completed" || r.status === "released",
          ).length,
        },
      ];
    },
  },
  mounted() {
    this.fetchInstallerRequests();
    this.fetchProfileHeaderDetails();
  },
  methods: {
    async accept(id) {
      try {
        await axios.put(
          `${this.baseURL}requests/${id}/accept`,
          {},
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        );
        // Force key initialization reactively for deep object tracing
        this.quotes[id] = null;
        await this.fetchInstallerRequests();
      } catch (err) {
        console.error("Failed to accept request:", err);
        alert("Could not process request acceptance.");
      }
    },

    async reject(id) {
      try {
        await axios.put(
          `${this.baseURL}requests/${id}/reject`,
          {},
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        );
        await this.fetchInstallerRequests();
      } catch (err) {
        console.error("Failed to reject request:", err);
        alert("Could not process request rejection.");
      }
    },

    async startJob(id) {
      try {
        await axios.put(
          `${this.baseURL}requests/${id}/start`,
          {},
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        );
        await this.fetchInstallerRequests();
      } catch (err) {
        console.error("Failed to start layout assignment:", err);
      }
    },

    async completeJob(id) {
      try {
        await axios.put(
          `${this.baseURL}requests/${id}/complete`,
          {},
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        );
        await this.fetchInstallerRequests();
      } catch (err) {
        console.error("Failed to complete assignment sequence:", err);
      }
    },

    async fetchProfileHeaderDetails() {
      try {
        if (this.installerStore.getInstallerProfile) {
          await this.installerStore.getInstallerProfile(this.baseURL);
        }
      } catch (err) {
        console.error("Failed to sync profile header metrics:", err);
      }
    },

    async fetchInstallerRequests() {
      this.loadingRequests = true;
      try {
        await this.installerStore.getRequests(this.baseURL);
        // Guarantee keys exist reactively within loop matrices
        if (this.installerStore.requests) {
          this.installerStore.requests.forEach((req) => {
            if (req.status === "accepted" && !(req._id in this.quotes)) {
              this.quotes[req._id] = req.priceQuote || null;
            }
          });
        }
      } catch (err) {
        console.error("Store request fetching log failure:", err);
      } finally {
        this.loadingRequests = false;
      }
    },

    async sendPriceQuote(requestId) {
      const price = this.quotes[requestId];
      if (!price || price <= 1000)
        return alert("Please enter a valid price quote above ₦1,000.");

      try {
        // 🟢 Hits your secure Express quoting endpoint router we constructed
        await axios.put(
          `${this.baseURL}requests/${requestId}/quote`,
          { priceQuote: price },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        );

        alert(
          "Price quotation submitted successfully! Customer has been notified to fund escrow.",
        );
        this.quotes[requestId] = null;
        await this.fetchInstallerRequests();
      } catch (err) {
        console.error(
          "Error submitting price quote:",
          err.response?.data || err.message,
        );
        alert(
          "Failed to submit price quote: " +
            (err.response?.data?.message || err.message),
        );
      }
    },

    confirmLogout() {
      if (this.$refs.closeModalBtn) {
        this.$refs.closeModalBtn.click(); // Programmatically closes the HTML modal backdrop safely
      }
      this.authStore.logout();
      this.$router.push("/login");
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    async onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.imagePreview = URL.createObjectURL(file);
      this.isUploading = true;

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.put(
          `${this.baseURL}installers/profile/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${this.authStore.token}`,
            },
          },
        );

        if (res.data.installer) {
          this.authStore.user = res.data.installer;
          localStorage.setItem("userData", JSON.stringify(res.data.installer));
        }

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
  },
};
</script>
