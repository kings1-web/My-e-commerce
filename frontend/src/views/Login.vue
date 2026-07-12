<template>
  <div class="text-center bg-dark text-white w-100 min-vh-100 d-flex flex-column justify-content-center py-5">
    <div v-if="authStore.sessionExpired" class="alert alert-warning mx-auto w-50 mb-4 animate-pulse">
      Session expired. Please log in again to continue.
    </div>
    
    <div class="container">
      <div class="row justify-content-center">
        <div id="login" class="flex-item border bg-white text-dark p-4 rounded-3 shadow-lg">
          <h2 class="pt-2 pb-3 fw-bold text-dark border-bottom mb-4">Sign In</h2>
          
          <form @submit.prevent="handleLoginProcess" class="form-group text-start">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Email Address</label>
              <input v-model="email" type="email" class="form-control" placeholder="name@example.com" required />
            </div>
            
            <div class="mb-4">
              <label class="form-label small fw-semibold text-muted">Password</label>
              <div class="input-group">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-end-0"
                  placeholder="••••••••"
                  required
                />
                <!-- Visibility toggle accessory layout anchor -->
                <button
                  type="button"
                  class="btn btn-outline-secondary bg-white border-start-0 text-muted px-3"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? "🙈" : "👁" }}
                </button>
              </div>
            </div>
            
            <button
              :disabled="loading"
              type="submit"
              class="btn btn-primary w-100 fw-bold py-2 shadow-sm uppercase tracking-wide"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";
import { useCartStore } from "@/stores/CartStore";

export default {
  name: "UnifiedLoginViewPortal",
  props: ["baseURL"],
  data() {
    return {
      authStore: useAuthStore(),
      email: null,
      password: null,
      loading: false,
      showPassword: false,
    };
  },
  mounted() {
    this.$emit("fetchData");
    this.$emit("updateCart");
  },
  methods: {
    async handleLoginProcess() {
      if (!this.email || !this.password) {
        this.$swal({ text: "Please fill all fields", icon: "warning" });
        return;
      }

      this.loading = true;
      try {
        const credentialsBody = {
          email: this.email.toLowerCase().trim(),
          password: this.password,
        };

        // Fire request directly to your unified role-minting backend endpoint
        const res = await axios.post(`${this.baseURL}users/login`, credentialsBody);

        console.log("📥 Login payload response metadata successfully received:", res.data);

        // 🟢 FIXED MAPPING DICTIONARY: Pull safely using exact fallback criteria names

        const extractedUserId = res.data.userDetails?.id || res.data.userId;

if (!extractedUserId) {
  console.error("🚨 Backend did not return userId correctly:", res.data);
  this.$swal({
    title: "Login Error",
    text: "User ID missing from server response",
    icon: "error"
  });
  return;
}

        const extractedEmail = res.data.user || res.data.email;
        const targetRolesArray = res.data.roles || ["customer"];

        // Pack array metrics straight down into your updated auth store action parameters
       this.authStore.login({
  token: res.data.token,
  email: extractedEmail,
  userId: extractedUserId,
  isAdmin: res.data.isAdmin || targetRolesArray.includes("admin"),
  roles: targetRolesArray
});

        // 🟢 PROFILE SYNC: Save the structural metadata block onto the store state context
        if (res.data.userDetails) {
          this.authStore.user = res.data.userDetails;
          localStorage.setItem("userData", JSON.stringify(res.data.userDetails));
        }

        // Initialize user cart data fields
        const cartStore = useCartStore();
        if (cartStore && typeof cartStore.loadCartForUser === 'function') {
          await cartStore.loadCartForUser(extractedUserId);
        }

        this.$emit("fetchData");
        this.$emit("updateCart");

        this.$swal({
          text: "Logged in successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });

        // Redirect the user straight to the root storefront view home page context
        this.$router.push({ name: "home" });

      } catch (err) {
        console.error("Authentication submission process refusal:", err);
        this.$swal({
          title: "Sign In Refused",
          text: err.response?.data || "Wrong credentials entry or server connection error.",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
#login {
  border: 1px solid #dee2e6;
  border-radius: 12px;
}
.btn-primary {
  background-color: #f0c14b;
  color: black;
  border: 1px solid #a88734;
  transition: all 0.15s ease;
}
.btn-primary:hover:not(:disabled) {
  background-color: #ddb347;
}
.input-group .form-control:focus {
  z-index: 3;
}
@media screen and (min-width: 768px) { #login { width: 50%; } }
@media screen and (min-width: 992px) { #login { width: 40%; } }
</style>
