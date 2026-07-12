<template>
  <div class="container my-5">
    <!-- Main Product Showcase Grid Row -->
    <div class="row pt-4">
      <!-- Left Column: Image Carousel -->
      <div
        id="productImageCarousel"
        class="carousel slide mb-4 col-md-5 col-12 shadow-sm rounded bg-white p-2 border"
        data-bs-ride="carousel"
      >
        <div class="carousel-inner">
          <div
            class="carousel-item"
            v-for="(img, index) in allImages"
            :key="index"
            :class="{ active: index === 0 }"
          >
            <img
              :src="img"
              class="img-fluid rounded object-fit-contain w-100"
              style="max-height: 400px"
              alt="Product Image"
            />
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#productImageCarousel"
          data-bs-slide="prev"
        >
          <span
            class="carousel-control-prev-icon bg-dark rounded-circle p-2"
          ></span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#productImageCarousel"
          data-bs-slide="next"
        >
          <span
            class="carousel-control-next-icon bg-dark rounded-circle p-2"
          ></span>
        </button>
      </div>

      <!-- Right Column: Product Specs & Actions -->
      <div class="col-md-7 col-12 ps-md-5 pt-3 pt-md-0">
        <h2 class="fw-bold text-dark mb-1">{{ product.name }}</h2>
        <span
          class="badge bg-secondary-subtle text-secondary border px-3 py-2 mb-3 text-uppercase font-monospace fs-7"
        >
          {{ category.name }}
        </span>

        <h3 class="fw-bold text-success mb-3">
          {{ formatPrice(product.price) }}
        </h3>

        <div class="border-top border-bottom py-3 my-3">
          <h6 class="fw-bold text-muted small uppercase">Description</h6>
          <p
            class="text-capitalize text-secondary mb-0"
            style="line-height: 1.6"
          >
            {{ product.discription }}
          </p>
        </div>

        <!-- Quantity Picker & Purchase Controls -->
        <div class="row g-3 align-items-center mb-4">
          <div class="col-sm-5">
            <div class="input-group">
              <span class="input-group-text bg-light fw-semibold small"
                >Qty</span
              >
              <input
                type="number"
                class="form-control text-center"
                v-model.number="quantity"
                :min="1"
              />
            </div>
          </div>
          <div class="col-sm-7">
            <button
              class="btn btn-success w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              type="button"
              id="add-to-cart-button"
              @click="addProductToCart(product)"
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>

        <!-- Product Features Container Box -->
        <div class="features bg-light rounded p-3 border text-capitalize">
          <h5 class="fw-bold text-dark border-bottom pb-2 mb-2">
            Key Highlights
          </h5>
          <ul class="mb-0 ps-3">
            <li class="text-secondary small py-1" style="white-space: pre-line">
              {{ product.richDiscription }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Inside your existing ShowDatail.vue template layout -->
    <div
      class="mt-4 p-3 bg-primary-subtle rounded border border-light-subtle shadow-xs"
    >
      <h6 class="fw-bold text-dark mb-1">
        🔧 Professional Setup Operations Workspace
      </h6>
      <p class="small text-muted mb-3">
        Track onboarding service status or debate pricing guidelines with your
        selected local technician safely on-platform.
      </p>

      <!-- 🟢 CASE A: Customer has not sent an installation request yet -->
      <button
        v-if="!activeContractRequest"
        type="button"
        class="btn btn-primary d-inline-flex align-items-center gap-2 shadow-xs fw-semibold"
        @click="openInstallationModal"
      >
        👨‍🔧 Request Installation Setup
      </button>

      <!-- 🟡 CASE B: Request is sent, but installer hasn't responded yet (Chat is locked) -->
      <div
        v-else-if="activeContractRequest.status === 'pending'"
        class="d-flex align-items-center gap-2"
      >
        <button class="btn btn-secondary btn-sm px-3 py-2 fw-semibold" disabled>
          ⏳ Request Sent (Awaiting Installer)
        </button>
        <span class="text-muted small italic ms-1"
          >Chat will unlock as soon as they accept.</span
        >
      </div>

      <!-- 🔵 CASE C: Installer accepted/quoted the contract (🟢 CHAT ACCESS UNLOCKED) -->
      <div v-else-if="activeContractRequest.status !== 'pending'">
        <RouterLink
          :to="{
            name: 'WorkspaceChat',
            params: {
              requestId: activeContractRequest._id || activeContractRequest.id,
            },
          }"
          class="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold shadow-xs text-white"
        >
          💬 Open Secure Installer Chat
        </RouterLink>
      </div>

      <div v-if="activeContractRequest" class="mt-3">
        <span class="badge bg-info">
          Status: {{ activeContractRequest.status }}
        </span>

        <span
          v-if="activeContractRequest.paymentStatus === 'paid'"
          class="badge bg-success ms-2"
        >
          💰 Escrow Funded
        </span>

        <span
          v-if="activeContractRequest.dispute?.isOpen"
          class="badge bg-danger ms-2"
        >
          ⚠️ Dispute Open
        </span>
      </div>

      <button
        v-if="
          activeContractRequest && activeContractRequest.status === 'completed'
        "
        class="btn btn-danger mt-2"
        @click="openDispute(activeContractRequest)"
      >
        ⚠️ Open Dispute
      </button>

      <router-link
        to="/installers"
        class="small text-primary text-decoration-none fw-semibold p-1"
      >
        View all network installers &rarr;
      </router-link>
    </div>

    <!-- ========================================================================= -->
    <!-- 🌟 NEW ARRANGEMENT: PRODUCT REVIEWS AND RATING LAYOUT SECTION -->
    <!-- ========================================================================= -->
    <div class="row g-4 border-top pt-5 mt-5">
      <!-- Left Review Grid Panel: Past Comments Feed -->
      <div class="col-lg-7">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-bold text-dark mb-0">
            Customer Feedback ({{ reviews ? reviews.length : 0 }})
          </h4>
          <div
            class="bg-light border rounded px-3 py-2 d-inline-flex align-items-center"
          >
            <span class="text-warning me-2 fs-5">★</span>
            <!--  TO THIS (Safe fallback checking syntax) -->
            <span class="fw-bold text-dark">
              {{ averageRating ? averageRating.toFixed(1) : "0.0" }}
            </span>
          </div>
        </div>

        <!--  CORRECT: Safe length validation fallback check -->
        <div
          v-if="!reviews || reviews.length === 0"
          class="text-center py-5 bg-light rounded border border-dashed"
        >
          <p class="text-muted mb-0">No item reviews submitted yet.</p>
        </div>

        <!-- Scrollable Reviews Thread Feed Container -->
        <div
          class="reviews-scroll-feed pe-1"
          v-else
          style="max-height: 500px; overflow-y: auto"
        >
          <div
            v-for="rev in reviews"
            :key="rev._id"
            class="card mb-3 shadow-xs border-light-subtle transition-hover"
          >
            <div class="card-body p-3">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <strong class="text-dark small fw-bold">{{
                  rev.user?.name || "Verified Buyer"
                }}</strong>
                <div class="text-warning small font-monospace">
                  <!-- Structural Star Array Mapping Loop -->
                  <span v-for="i in 5" :key="i">{{
                    i <= rev.rating ? "★" : "☆"
                  }}</span>
                </div>
              </div>
              <p
                class="text-secondary small mb-0 bg-light p-2 rounded border-start border-primary border-3"
                style="line-height: 1.5"
              >
                {{ rev.comment }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Review Grid Panel: Interactive Entry Feedback Form Container -->
      <div class="col-lg-5">
        <div
          class="card bg-light border-0 p-4 sticky-md-top"
          style="top: 25px; z-index: 5"
        >
          <h5 class="fw-bold text-dark mb-3">Write a Product Review</h5>

          <!-- Interactive Star Input Element System Layout -->
          <div class="mb-3">
            <label class="form-label d-block text-muted small fw-semibold"
              >Your Product Rating</label
            >
            <div class="fs-3 d-inline-flex gap-1 cursor-pointer select-none">
              <span
                v-for="star in 5"
                :key="star"
                @click="rating = star"
                class="text-warning star-hover"
              >
                <i
                  :class="star <= rating ? 'bi bi-star-fill' : 'bi bi-star'"
                ></i>
              </span>
            </div>
          </div>

          <!-- Text Comment Area Box Form Entry Section -->
          <div class="mb-2">
            <label class="form-label text-muted small fw-semibold"
              >Share Your Opinion</label
            >
            <textarea
              v-model="comment"
              class="form-control form-control-sm"
              rows="4"
              :maxlength="maxCharacters"
              placeholder="What did you like or dislike about this product? How is the hardware performance quality?"
              required
            ></textarea>
          </div>

          <!-- Real-Time Input Character Counters Tracker Elements UI -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small text-muted" style="font-size: 0.75rem"
              >Keep your feedback concise.</span
            >
            <span :class="characterCounterClass" style="font-size: 0.8rem">
              <!-- 🟢 OPTIMIZED: Safe against empty or null comment string clearing resets -->
              {{ maxCharacters - (comment ? comment.length : 0) }} /
              {{ maxCharacters }} left
            </span>
          </div>

          <button
            class="btn btn-primary w-100 fw-bold py-2 shadow-xs"
            @click="submitReview"
            :disabled="
              isSubmittingReview || comment.trim().length === 0 || rating === 0
            "
          >
            <span
              v-if="isSubmittingReview"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            Submit Review Post
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- INSTALLATION ADDRESS INPUT MODAL CONTAINER -->
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
            <h5 class="modal-title" id="addrModalLabel">
              Confirm Installation Site
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref="closeSetupModalBtn"
            ></button>
          </div>
          <form @submit.prevent="submitSingleInstallerRequest">
            <div class="modal-body py-4">
              <!-- Step 1: Select an Approved Installer from a Dropdown -->
              <div class="mb-3">
                <label class="form-label small fw-semibold"
                  >Choose Your Nearby Technician</label
                >
                <select
                  v-model="selectedInstallerId"
                  class="form-select"
                  required
                >
                  <option value="" disabled selected>
                    -- Select an Approved Installer --
                  </option>
                  <option
                    v-for="inst in approvedInstallers"
                    :key="inst._id"
                    :value="inst._id"
                  >
                    {{ inst.name }} — {{ inst.location }} ({{
                      inst.skills?.slice(0, 2).join(", ")
                    }})
                  </option>
                </select>
                <div
                  v-if="approvedInstallers.length === 0"
                  class="small text-danger mt-1"
                >
                  No technicians are currently available.
                </div>
              </div>

              <!-- Step 2: Provide Location Address -->
              <div class="mb-3">
                <label class="form-label small fw-semibold"
                  >Installation Site Address</label
                >
                <textarea
                  v-model="customerAddress"
                  class="form-control"
                  rows="3"
                  placeholder="Provide complete street address, apartment number, and city..."
                  maxlength="150"
                  required
                ></textarea>
                <div class="text-end small text-muted mt-1">
                  {{ 150 - customerAddress.length }} characters remaining
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button
                type="button"
                class="btn btn-secondary px-4"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary px-4"
                :disabled="isSubmitting || !selectedInstallerId"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Send Setup Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth"; // ✅ Imports your standard customer profile store
//import { useInstallerStore } from "@/stores/installer";
import { useCartStore } from "@/stores/CartStore";
import axios from "axios";

export default {
  props: {
    baseURL: String,
    categories: Array,
    products: Array,
  },
  data() {
    return {
      authStore: useAuthStore(),
      product: {},
      category: {},
      quantity: 1,
      token: null,

      // 🟢 FIXED: Ensures .length never reads as undefined on initial render mount
      reviews: [],
      rating: 0,
      comment: "",
      maxCharacters: 300,
      isSubmittingReview: false,

      // Installer properties
      approvedInstallers: [],
      selectedInstallerId: "",
      customerAddress: "",
      isSubmitting: false,

      // 🟢 ADDED: Tracks active escrow request instances for this page item
      activeContractRequest: null,

      bsModalInstance: null,
    };
  },
  computed: {
    averageRating() {
      // 🟢 DEFENSIVE CHECK: If reviews is missing, empty, or not an array, return 0 instantly
      if (
        !this.reviews ||
        !Array.isArray(this.reviews) ||
        this.reviews.length === 0
      ) {
        return 0;
      }

      const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
      return total / this.reviews.length;
    },

    characterCounterClass() {
      // Falls back to a default max count if maxCharacters isn't defined in data()
      const maxChars = this.maxCharacters || 300;
      const currentLength = this.comment ? this.comment.length : 0;
      const remaining = maxChars - currentLength;

      if (remaining <= 30) {
        return "small fw-bold text-danger animate-pulse";
      }
      if (remaining <= 75) {
        return "small fw-semibold text-warning";
      }
      return "small text-success";
    },

    allImages() {
      // Combine main image and additional images, filter out undefined/null
      const images = [this.product.image, ...(this.product.images || [])];
      return images.filter(Boolean);
    },
  },
  methods: {
    async openDispute(request) {
      const { value: reason } = await this.$swal({
        title: "Open Dispute",
        input: "text",
        inputPlaceholder: "Enter reason...",
        showCancelButton: true,
      });

      if (!reason) return;

      try {
        await axios.put(
          `${this.baseURL}requests/${request._id}/dispute`,
          { reason },
          {
            headers: {
              Authorization: `Bearer ${this.authStore.token}`,
            },
          },
        );

        this.$swal("Dispute opened!", "", "success");

        // refresh request
        await this.checkActiveUserInstallationRequest(this.product.id);
      } catch (err) {
        console.error(err);
      }
    },

    // 🟢 ADDED METHOD: Automatically syncs request states from MongoDB when the product loads
    async checkSpecificInstallerRequestStatus() {
      if (!this.authStore.token) return;

      try {
        const customerId =
          this.authStore.user?.id ||
          this.authStore.user?._id ||
          this.authStore.userId;

        const res = await axios.get(
          `${this.baseURL}requests/check-installer-status/${this.id}/${customerId}`,
          {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          },
        );

        this.activeContractRequest = res.data || null;
      } catch (err) {
        console.error(
          "Error evaluating installer profile request mappings:",
          err,
        );
        this.activeContractRequest = null;
      }
    },

    // 1. Opens the installation form overlay window
    async openInstallationModal() {
      // 🔐 Security boundary guard: Force customer authorization sequence checks
      if (!this.authStore.token) {
        this.$swal({
          text: "Please log into your customer account first to submit service bookings.",
          icon: "info",
        });
        this.$router.push("/login");
        return;
      }

      try {
        // Fetch all active approved technicians automatically for selection lists
        const res = await axios.get(`${this.baseURL}installers/approved`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        });
        this.approvedInstallers = Array.isArray(res.data) ? res.data : [];

        // Reset old address form memory states safely
        this.customerAddress = "";
        this.selectedInstallerId = "";

        // Open the Bootstrap Modal overlay container
        const modalElement = document.getElementById("productPageAddressModal");
        if (modalElement) {
          this.bsModalInstance = new bootstrap.Modal(modalElement);
          this.bsModalInstance.show();
        }
      } catch (err) {
        console.error("Error setting up marketplace options dialog:", err);
        this.$swal({
          text: "Could not load technicians records.",
          icon: "warning",
        });
      }
    },

    async submitSingleInstallerRequest() {
      const customerId = this.authStore.userId;
      const customerPhone = this.authStore.user?.phone;

      const installerId = this.selectedInstallerId; // ✅ FIXED

      if (!customerId) return alert("Customer ID missing.");

      if (!installerId) {
        return alert("Installer not selected properly.");
      }

      if (!customerPhone) {
        return alert("Your phone number is missing. Update your profile.");
      }

      if (!this.customerAddress || !this.customerAddress.trim()) {
        return alert("Please enter a valid address.");
      }

      this.isSubmitting = true;

      try {
        const targetProductId = this.$route.params.id || null;


        await axios.post(
          `${this.baseURL}requests/send-to-installer`,
          {
            userId: customerId,
            installerId,
            address: this.customerAddress.trim(),
            phone: String(customerPhone).trim(),
            productId: targetProductId,
          },
          {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          },
        );

      if (this.bsModalInstance) {
  this.bsModalInstance.hide();
}

setTimeout(() => {
  this.$swal({
    title: "Request Sent! 🚀",
    icon: "success"
  });
}, 300);

        this.customerAddress = "";

        await this.checkSpecificInstallerRequestStatus();
      } catch (err) {
        console.error("Frontend Submit Error:", err);
        alert(err.response?.data?.message || "Failed to send request.");
      } finally {
        this.isSubmitting = false;
      }
    },

    addProductToCart(product) {
      if (!this.token) {
        this.$swal({
          text: "Please login to add item",
          icon: "error",
        });
        return;
      }

      const CartStore = useCartStore();
      const qty = this.quantity > 0 ? this.quantity : 1;
      CartStore.addToCart(product, qty);
      this.$swal({
        text: "Product added to cart successfully!",
        icon: "success",
      });
    },
    checkout() {
      this.$router.push({ name: "BillingAddress" });
    },
    formatPrice(value) {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(value);
    },

    // Inside ShowDatail.vue -> methods
    async getReviews(productId) {
      try {
        // ✅ PERFECT MATCH: Matches your corrected backend route layout perfectly
        const res = await axios.get(
          `${this.baseURL}reviews/product/${productId}`,
        );
        this.reviews = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    },

    async submitReview() {
      if (!this.authStore.token) {
        alert("Please log in first to submit public feedback.");
        return;
      }

      // 🟢 CAPTURE THE ID DIRECTLY FROM THE ROUTE URL
      // If your route is /product/:id, this extracts the exact string we need
      const exactProductId = this.$route.params.id || this.productId;

      if (!exactProductId) {
        alert(
          "System Error: Product tracking ID could not be resolved from the current page URL.",
        );
        return;
      }

      this.isSubmittingReview = true;
      try {
        const customerId = this.authStore.user?.id || this.authStore?.userId;

        await axios.post(
          `${this.baseURL}reviews`,
          {
            userId: customerId,
            product: exactProductId, // Sending the guaranteed 24-character ID string
            rating: Number(this.rating),
            comment: this.comment.trim(),
          },
          {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          },
        );

        alert("Review uploaded securely!");
        this.rating = 0;
        this.comment = "";

        // Refresh the reviews on screen instantly
        await this.getReviews(exactProductId);
      } catch (err) {
        console.error("Submission blocked:", err.response?.data || err.message);
        alert(
          "Submission Failed: " +
            (err.response?.data?.message ||
              "Invalid payload format sent to server."),
        );
      } finally {
        this.isSubmittingReview = false;
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
  async mounted() {
    const id = this.$route.params.id;
    this.product = this.products.find((p) => p && p.id == id) || {};
    this.category =
      this.categories.find((c) => c.id == this.product.category?.id) || {};
    this.token = localStorage.getItem("token");

  if (this.product?.id) {
  await this.checkSpecificInstallerRequestStatus();
}

    this.$emit("fetchData");
  },
};
</script>

<style scoped>
.category {
  font-weight: 400;
}
#wishlist-button {
  background-color: #b9b9b9;
}
#add-to-cart-button {
  background-color: orangered;
  color: white;
}
.form-control {
  width: 100%;
}

.card {
  border-radius: 10px;
}

.btn-sm {
  font-size: 12px;
}
</style>
