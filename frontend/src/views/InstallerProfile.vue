<template>
  <div class="container my-5" v-if="installer">
    <!-- Profile Banner Card -->
    <div class="card shadow-sm border-0 p-4 mb-4 bg-white">
      <div class="d-flex flex-column flex-md-row align-items-center gap-4">
        <img
          :src="installer.images || '/default-avatar.png'"
          alt="Installer Profile"
          class="rounded-circle border img-thumbnail object-fit-cover shadow-sm"
          style="width: 120px; height: 120px; object-fit: cover"
        />
        <div class="text-center text-md-start flex-grow-1">
          <h2 class="fw-bold text-dark mb-1">{{ installer.name }}</h2>
          <p class="text-muted mb-2">
            <i class="bi bi-geo-alt me-1"></i> {{ installer.location }}
          </p>

          <!-- Rating Summary Badge Row -->
          <div class="d-flex justify-content-center justify-content-md-start align-items-center gap-2 mb-3">
            <span class="text-warning fs-5">
              <i
                v-for="star in 5"
                :key="star"
                :class="getStarClass(installer.averageRating || 0, star)"
              ></i>
            </span>
            <span class="fw-bold text-dark mb-0 ms-1">
              {{ installer.averageRating ? installer.averageRating.toFixed(1) : "0.0" }}
            </span>
            <span class="text-muted small">({{ installer.reviewCount || 0 }} reviews)</span>
          </div>

          <!-- Skills Badges -->
          <div class="d-flex flex-wrap justify-content-center justify-content-md-start gap-1">
            <span
              v-for="skill in installer.skills"
              :key="skill"
              class="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Contact CTA Actions Panel Wrapper -->
        <div class="flex-shrink-0 mt-3 mt-md-0 text-center text-md-end min-width-200">
          

          <!-- 🟢 CASE A: Customer has NOT sent an installation request yet -->
          <button
            v-if="!activeContractRequest"
            type="button"
            class="btn btn-primary px-4 py-2 fw-bold shadow-xs d-inline-flex align-items-center gap-2 w-100 justify-content-center"
            @click="openRequestModal"
          >
            👨‍🔧 Request Installation Setup
          </button>

          <!-- 🟡 CASE B: Request is sent, but technician is still pending (Chat Locked) -->
          <div v-else-if="activeContractRequest.status === 'pending'" class="text-center w-100">
            <button class="btn btn-secondary py-2 px-3 fw-semibold small w-100" disabled>
              ⏳ Request Sent (Pending)
            </button>
            <small class="text-muted d-block mt-1 italic" style="font-size: 0.72rem;">
              Chat unlocks when they accept.
            </small>
          </div>

          <!-- 🔵 CASE C: Technician accepted/quoted (🟢 CHAT ACCESS UNLOCKED) -->
          <div v-else class="w-100">
            <RouterLink
              :to="{ name: 'WorkspaceChat', params: { requestId: activeContractRequest._id || activeContractRequest.id } }"
              class="btn btn-success px-4 py-2 fw-bold shadow-xs text-white d-inline-flex align-items-center gap-2 w-100 justify-content-center"
            >
              💬 Open Secure Chat
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Submission & Feedback Logs Grid Row -->
    <div class="row g-4 border-top pt-4">
      <!-- Left Column: Past Client Review Items List Feed -->
      <div class="col-lg-7">
        <h4 class="fw-bold text-dark mb-3">Client Feedback Feed</h4>

        <div
          v-if="!installer.reviews || installer.reviews.length === 0"
          class="text-center py-5 bg-light rounded border border-dashed"
        >
          <p class="text-muted mb-0">No performance reviews submitted for this technician yet.</p>
        </div>

        <div class="reviews-feed" v-else>
          <div
            v-for="rev in installer.reviews"
            :key="rev._id"
            class="card mb-3 border-light-subtle shadow-xs"
          >
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <strong class="text-dark small fw-bold">{{ rev.user?.name || "Verified Client" }}</strong>
                <div class="text-warning small">
                  <span v-for="i in 5" :key="i">{{ i <= rev.rating ? "★" : "☆" }}</span>
                </div>
              </div>
              <p class="text-secondary small mb-0 bg-light p-2 rounded border-start border-success border-3">
                {{ rev.comment }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Review Entry Form Container Panel -->
      <div class="col-lg-5">
        <div class="card bg-light border-0 p-4 sticky-md-top" style="top: 25px; z-index: 5">
          <h5 class="fw-bold text-dark mb-3">Rate Service Quality</h5>

          <!-- Interactive Star Input Element System Layout -->
          <div class="mb-3">
            <label class="form-label d-block text-muted small fw-semibold">Service Performance Score</label>
            <div class="fs-3 d-inline-flex gap-1 cursor-pointer select-none">
              <span
                v-for="star in 5"
                :key="star"
                @click="rating = star"
                class="text-warning star-hover"
              >
                <i :class="star <= rating ? 'bi bi-star-fill' : 'bi bi-star'"></i>
              </span>
            </div>
          </div>

          <!-- Text Comment Area Box Form Entry Section -->
          <div class="mb-3">
            <label class="form-label text-muted small fw-semibold">Your Review Details</label>
            <textarea
              v-model="comment"
              class="form-control"
              rows="4"
              maxlength="250"
              placeholder="Tell us about their arrival time, operational competency, technical workflow capability, and general clean-up conduct..."
              required
            ></textarea>
            <div class="text-end small text-muted mt-1" style="font-size: 0.75rem">
              {{ 250 - (comment ? comment.length : 0) }} / 250 characters left
            </div>
          </div>

          <button
            class="btn btn-dark w-100 fw-bold py-2 shadow-xs"
            @click="submitInstallerReview"
            :disabled="isSubmitting || !comment || comment.trim().length === 0 || rating === 0"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            Submit Review Form
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 🟢 ADDED: INSTALLATION ADDRESS INPUT MODAL CONTAINER -->
    <!-- ========================================================================= -->
    <div
      class="modal fade"
      id="productPageAddressModal"
      tabindex="-1"
      aria-labelledby="addrModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="addrModalLabel">Confirm Installation Site</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref="closeAddressModalBtn"
            ></button>
          </div>
          
          <form @submit.prevent="submitSingleInstallerRequest">
            <div class="modal-body py-4">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Installation Site Address</label>
                <textarea
                  v-model="customerAddress"
                  class="form-control"
                  rows="3"
                  placeholder="Provide complete street address, apartment number, and city..."
                  maxlength="150"
                  required
                ></textarea>
                <div class="text-end small text-muted mt-1" style="font-size: 0.75rem;">
                  {{ 150 - (customerAddress ? customerAddress.length : 0) }} characters remaining
                </div>
              </div>
            </div>
            
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Cancel</button>
              <button
                type="submit"
                class="btn btn-primary px-4 fw-bold"
                :disabled="isProcessingRequest || !customerAddress || customerAddress.trim().length === 0"
              >
                <span v-if="isProcessingRequest" class="spinner-border spinner-border-sm me-2"></span>
                Send Setup Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>

  <!-- Main Loader Spinner Layout Fallback Element -->
  <div v-else class="text-center py-5 my-5 text-muted">
    <div class="spinner-border text-primary mb-3" role="status"></div>
    <p class="mb-0 small">Retrieving technical operational log data files...</p>
  </div>
</template>
<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "InstallerProfileView",
  props: {
    id: { type: String, required: true }, // Passed directly from route dynamic parameter mappings
    baseURL: { type: String, default: "http://localhost:3000/api/v1/" },
  },
  data() {
    return {
      authStore: useAuthStore(),
      installer: null,
      rating: 0,
      comment: "",
      isSubmitting: false,

      // 🟢 ADDED: Caches active request rows connecting this customer and this installer
    activeContractRequest: null 
    };
  },
  async mounted() {
    await this.loadInstallerDetails();

  
  // 🟢 Fetch matching request profiles between active logged-in user and current profile technician
  if (this.id) {
    await this.checkSpecificInstallerRequestStatus();
  }
  },
  methods: {

     // 🟢 ADDED METHOD: Queries MongoDB to see if this customer already has a pending/active contract with this installer
  async checkSpecificInstallerRequestStatus() {
    if (!this.authStore.token) return; // Skip if visitor is anonymous guest

    try {
      const customerId = this.authStore.user?.id || this.authStore.user?._id || this.authStore.userId;
      
      // Calls a specialized search lookup endpoint on your backend Request router
      const res = await axios.get(`${this.baseURL}Requests/check-installer-status/${this.id}/${customerId}`, {
        headers: { Authorization: `Bearer ${this.authStore.token}` }
      });
      
      this.activeContractRequest = res.data || null;
    } catch (err) {
      console.error("Error evaluating installer profile request mappings:", err);
      this.activeContractRequest = null;
    }
  },

   openRequestModal() {
    if (!this.authStore.token) {
      this.$swal({ text: "Please sign in to your customer account to submit setup requests.", icon: "warning" });
      this.$router.push('/login');
      return;
    }

    // Opens your Bootstrap text form input address fields modal dynamically
    const modalElement = document.getElementById('productPageAddressModal');
    if (modalElement) {
      const bootstrapInstance = window.bootstrap;
      if (bootstrapInstance && bootstrapInstance.Modal) {
        const bootstrapModal = new bootstrapInstance.Modal(modalElement);
        bootstrapModal.show();
      }
    }
  },

   // 🟢 UPDATED: Force status re-evaluation after user clicks submit inside your address dialog box
  async submitSingleInstallerRequest() {
    const customerId = this.authStore.user?.id || this.authStore.user?._id || this.authStore.userId;
    if (!customerId) return alert("Customer ID missing.");

    this.isProcessingRequest = true;
    try {
      // Pull optional product context variables out of state or route if available
      const targetProductId = this.$route.params.productId || null;

      await axios.post(`${this.baseURL}Requests/send-to-installer`, {
        userId: customerId,
        installerId: this.id, // Current technician profile ID
        address: this.customerAddress.trim(),
        productId: targetProductId
      }, {
        headers: { Authorization: `Bearer ${this.authStore.token}` }
      });

      if (this.$refs.closeAddressModalBtn) {
        this.$refs.closeAddressModalBtn.click();
      }

      this.$swal({ title: "Request Sent! 🚀", icon: "success" });
      this.customerAddress = "";

      // 🟢 RE-REFRESH: Switches the button state instantly to "Request Sent (Pending)"
      await this.checkSpecificInstallerRequestStatus();

    } catch (err) {
      console.error(err);
      alert("Failed to process installation request transaction.");
    } finally {
      this.isProcessingRequest = false;
    }
  },


    async loadInstallerDetails() {
      try {
        const res = await axios.get(
          `${this.baseURL}installers/${this.id}/details`,
        );
        this.installer = res.data;
      } catch (err) {
        console.error("Error pulling installer data attributes:", err);
        alert(
          "Failed to populate profile logs configuration file mapping data.",
        );
      }
    },

    async submitInstallerReview() {
      if (!this.authStore.token) {
        alert(
          "Please sign into your customer portal profile account before rating technician services.",
        );
        return;
      }

      this.isSubmitting = true;
      try {
        const customerId = this.authStore.user?.id || this.authStore?.userId;

        await axios.post(
          `${this.baseURL}installer-reviews`,
          {
            userId: customerId,
            installerId: this.id,
            rating: this.rating,
            comment: this.comment.trim(),
          },
          {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          },
        );

        alert("Performance review successfully published to public boards.");
        this.rating = 0;
        this.comment = "";

        // Refresh detail profiles synchronously
        await this.loadInstallerDetails();
      } catch (err) {
        console.error(err);
        alert("Could not complete submission sequence operations details.");
      } finally {
        this.isSubmitting = false;
      }
    },
    getStarClass(avgRating, starIndex) {
      if (avgRating >= starIndex) return "bi bi-star-fill";
      if (avgRating >= starIndex - 0.5) return "bi bi-star-half";
      return "bi bi-star";
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.select-none {
  user-select: none;
}
.star-hover {
  transition: transform 0.1s ease;
}
.star-hover:hover {
  transform: scale(1.15);
}
.border-end-md {
  border-right: none;
}
@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid #dee2e6 !important;
  }
}
</style>
