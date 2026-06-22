<template>
  <div class="container my-5">
    <!-- Header Section -->
    <div class="row align-items-center mb-4 pb-3 border-bottom">
      <div class="col-md-8">
        <h3 class="fw-bold text-dark mb-1">
          Available Professional Installers
        </h3>
        <p class="text-muted mb-0">
          Select a certified professional to handle your hardware setup
        </p>
      </div>
      <div class="col-md-4 text-md-end mt-2 mt-md-0">
        <div
          class="d-inline-flex align-items-center bg-light border rounded px-3 py-2"
        >
          <span class="text-warning me-2 fs-5">★</span>
          <!-- Added defensive checking constraint to prevent initial load crash -->
          <span class="fw-bold text-dark">{{
            averageRating ? averageRating.toFixed(1) : "0.0"
          }}</span>
          <span class="text-muted ms-1 small">/ 5.0 Rating</span>
        </div>
      </div>
    </div>

    <!-- Installer Section -->
    <div class="mb-5">
      <div
        v-if="installers.length === 0"
        class="text-center py-4 bg-light rounded border border-dashed"
      >
        <p class="text-muted mb-0">
          No certified installers are available for this area currently.
        </p>
      </div>

      <div class="row g-3" v-else>
        <div
          v-for="installer in installers.slice(0, 3)"
          :key="installer._id"
          class="col-12"
        >
          <div
            class="card shadow-sm h-100 border border-light-subtle transition-hover"
          >
            <div
              class="card-body p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
            >
              <!-- Left Profile Profile Info Section -->
              <div class="d-flex flex-column gap-1">
                <RouterLink
                  :to="{
                    name: 'InstallerProfile',
                    params: { id: installer._id },
                  }"
                  class="text-decoration-none d-flex align-items-center gap-3"
                >
                  <div
                    class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                    style="width: 50px; height: 50px; min-width: 50px"
                  >
                    {{ installer.name?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h6 class="fw-bold mb-1 text-dark text-underline-hover">
                      {{ installer.name }}
                    </h6>
                    <span class="text-muted small d-flex align-items-center">
                      <i class="bi bi-geo-alt me-1"></i>
                      {{ installer.location }}
                    </span>
                  </div>
                </RouterLink>

                <!-- ✅ FIXED HTML BRACKETS: Placed the rating layout cleanly aligned below information text values -->
                <div class="installer-rating mt-2 ps-1">
                  <div class="d-flex align-items-center gap-1">
                    <span
                      class="stars text-warning small"
                      style="font-size: 0.8rem"
                    >
                      <i
                        v-for="star in 5"
                        :key="star"
                        :class="
                          getStarClass(installer.averageRating || 0, star)
                        "
                      ></i>
                    </span>
                    <span class="text-muted ms-1" style="font-size: 0.75rem">
                      {{
                        installer.averageRating
                          ? installer.averageRating.toFixed(1)
                          : "0.0"
                      }}
                      ({{ installer.reviewCount || 0 }} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <!-- Skills tags block -->
              <div class="flex-grow-1 px-md-3">
                <div class="d-flex flex-wrap gap-1">
                  <span
                    v-for="skill in installer.skills"
                    :key="skill"
                    class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>

              <!-- Status Badge & CTA actions mapping -->
              <div
                class="d-flex align-items-center justify-content-between justify-content-md-end gap-3 min-width-md-300"
              >
                <span :class="getStatusBadgeClass(installer.status)">
                  {{ installer.status || "Active" }}
                </span>

                <div class="btn-group gap-2">
                  <!-- 🟢 FIXED SYNTAX: Replaced missing template literal dollar operator -->
                  <!-- Inside Customer requests/orders list loop -->

    

                  <!-- ✅ RESTORED BUTTON METHOD: Reinserted the missing request submission trigger option button -->
                  <button
                    class="btn btn-primary btn-sm px-3"
                    @click="requestInstaller(installer._id)"
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Hyperlink element -->
      <div v-if="installers.length > 3" class="mt-3 text-end">
        <router-link
          to="/installers"
          class="text-primary text-decoration-none fw-semibold small"
        >
          View all technicians &rarr;
        </router-link>
      </div>
    </div>

    <!-- 🟢 MODAL ADDED HERE: Placed perfectly inside the main wrapper component element -->
    <div
      class="modal fade"
      id="addressModal"
      tabindex="-1"
      aria-labelledby="addressModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-dark" id="addressModalLabel">
              Request Installation
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref="closeAddressModalBtn"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitInstallationRequest">
              <div class="mb-3">
                <label
                  for="customerAddressInput"
                  class="form-label small fw-semibold text-muted"
                  >Delivery & Installation Address</label
                >
                <textarea
                  id="customerAddressInput"
                  class="form-control"
                  rows="3"
                  v-model="customerAddress"
                  placeholder="Enter your complete home or office address..."
                  required
                >
                </textarea>
              </div>
              <div class="modal-footer px-0 pb-0">
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary btn-sm"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Confirm & Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useInstallerStore } from "@/stores/installer";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "InstallerDirectoryWidget",
  props: {
    baseURL: { type: String, required: true },
    products: { type: Array, default: () => [] }, // Receives inventory array collection maps cleanly
  },
  data() {
    return {
      installerStore: useInstallerStore(),
      authStore: useAuthStore(),
      installers: [],
      rating: 0,
      comment: "",
      reviews: [],
      isSubmitting: false,
      maxCharacters: 300,

      //installer

      // Modal tracking parameters definitions
      customerAddress: "",
      selectedInstallerId: null,

      // 🟢 FIXED: Fallback tracking capture point pulls target item string dynamically out of active browser path parameters
      // productId: this.$route.params.id || this.$route.params.productId || null
    };
  },
  computed: {
    averageRating() {
      if (
        !this.reviews ||
        !Array.isArray(this.reviews) ||
        this.reviews.length === 0
      )
        return 0;
      const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
      return total / this.reviews.length;
    },
    remainingCharacters() {
      return this.maxCharacters - this.comment.length;
    },
    characterCounterClass() {
      if (this.remainingCharacters <= 30)
        return "small fw-bold text-danger animate-pulse";
      if (this.remainingCharacters <= 75)
        return "small fw-semibold text-warning";
      return "small text-success";
    },
  },
  async mounted() {
    await this.fetchHomeInstallers();
    // ✅ FIXED: Safely reads the dynamic state variable tracker
    if (this.productId) {
      await this.getReviews(this.productId);
    }
  },
  methods: {
    getStarClass(avgRating, starIndex) {
      if (avgRating >= starIndex) return "bi bi-star-fill";
      if (avgRating >= starIndex - 0.5) return "bi bi-star-half";
      return "bi bi-star";
    },
    async fetchHomeInstallers() {
      try {
        const res = await axios.get(`${this.baseURL}installers/approved`);
        this.installers = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Public display fetch error:", err.message);
        this.installers = [];
      }
    },
    async getReviews(productId) {
      try {
        const res = await axios.get(
          `${this.baseURL}reviews/product/${productId}`,
        );
        this.reviews = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    },

    // Step 1: Triggered when user clicks "Request" button in list layout
  /* requestInstaller(installerId) {
      if (!this.authStore.token) {
        this.$swal({
          text: "Please sign into your customer account first to request an installation.",
          icon: "warning",
        });
        this.$router.push("/login");
        return;
      }

      this.selectedInstallerId = installerId;
      this.customerAddress = ""; // Clear old state values safely

      // 🟢 FIXED: Finding and instantiating Bootstrap module safely via verified reference calls
      const modalElement = document.getElementById("addressModal");
      if (modalElement) {
        const bootstrapModal = new bootstrap.Modal(modalElement);
        bootstrapModal.show();
      } else {
        console.error(
          "Critical HTML Error: No template dialog container wrapper exists tracking id='addressModal'",
        );
      }
    },

    // Step 2: Triggered when user clicks "Confirm & Send Request" inside modal popup
    async submitInstallationRequest() {
      const customerId =
        this.authStore.user?.id ||
        this.authStore.user?._id ||
        this.authStore.userId;

      if (!customerId) {
        this.$swal({
          text: "Customer profile data missing. Please try logging out and back in.",
          icon: "warning",
        });
        return;
      }

      this.isSubmitting = true;
      try {
        // 🟢 FIXED PAYLOAD: Ensures the product payload parameter string can never fall back to undefined tracking
        const targetProductId = this.productId || this.$route.params.id;

        await axios.post(
          `${this.baseURL}Requests`,
          {
            userId: customerId,
            installerId: this.selectedInstallerId,
            product: targetProductId,
            address: this.customerAddress.trim(),
          },
          {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          },
        );

        // Close modal programmatically by pulling click trigger from the close button node ref
        // Ensure your modal wrapper contains: ref="closeAddressModalBtn" inside its HTML tag!
        if (this.$refs.closeAddressModalBtn) {
          this.$refs.closeAddressModalBtn.click();
        }

        this.$swal({
          text: "Installation request submitted to technician dashboard!",
          icon: "success",
        });
      } catch (err) {
        console.error("Escrow setup generation crash:", err);
        this.$swal({
          text:
            "Failed to submit request: " +
            (err.response?.data?.message || err.message),
          icon: "warning",
        });
      } finally {
        this.isSubmitting = false;
      }
    },*/

    async submitReview() {
      if (!this.authStore.token) {
        alert("Please authorize or login first to submit public feedback.");
        return;
      }
      if (this.rating === 0 || !this.comment.trim()) {
        alert(
          "Both a structural rating selection and comment value are required fields.",
        );
        return;
      }

      this.isSubmitting = true;
      try {
        await axios.post(
          `${this.baseURL}reviews`,
          {
            product: this.productId || this.$route.params.id,
            rating: this.rating,
            comment: this.comment.trim(),
          },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        );

        alert("Review uploaded securely!");
        this.rating = 0;
        this.comment = "";
        await this.getReviews(this.productId || this.$route.params.id);
      } catch (err) {
        console.error(err);
        alert("Could not process review submission data.");
      } finally {
        this.isSubmitting = false;
      }
    },
    getStatusBadgeClass(status) {
      const base = "badge px-3 py-2 text-uppercase font-monospace ";
      if (status === "accepted")
        return (
          base + "bg-success-subtle text-success border border-success-subtle"
        );
      if (status === "rejected")
        return (
          base + "bg-danger-subtle text-danger border border-danger-subtle"
        );
      return (
        base +
        "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
      );
    },
  },
};
</script>

<style scoped>
.text-underline-hover {
  transition: color 0.2s ease;
}
.text-underline-hover:hover {
  color: #0d6efd !important; /* Bootstrap Primary Blue color accent */
  text-decoration: underline;
}
</style>
