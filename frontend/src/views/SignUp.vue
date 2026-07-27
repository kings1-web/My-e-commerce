<template>
  <div class="bg-dark text-white min-vh-100 py-5">
    <div class="container">
      <div class="row">
        <div class="col-12 text-center pt-3">
          <!-- Logo Display Placeholder (styled to align nicely) -->
          <h1 class="fw-bold tracking-wide mb-2" style="color: orangered;">ROYAL-GOODS</h1>
        </div>
      </div>

      <div class="row justify-content-center mt-4">
        <div class="col-lg-8 col-xl-7">
          <div id="signup-div" class="flex-item-border bg-white text-dark p-4 rounded-3 shadow-lg">
            <h2 class="pt-2 pb-4 fw-bold text-dark border-bottom mb-4">Create Your Account</h2>
            
            <!-- 🟢 FIXED FORM ACTION: Uses native submit listeners with modifiers to prevent native page reloads cleanly -->
            <form @submit.prevent="handleSignupSubmit" class="row g-3">
              <div class="col-md-6">
                <label for="inputEmail4" class="form-label small fw-semibold text-muted">Email Address</label>
                <input
                  type="email"
                  v-model="email"
                  class="form-control"
                  id="inputEmail4"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="inputPassword4" class="form-label small fw-semibold text-muted">Password</label>
                <input
                  type="password"
                  v-model="password"
                  class="form-control"
                  id="Password"
                  required
                />
              </div>

              <div class="col-12">
                <label for="name" class="form-label small fw-semibold text-muted">Full Name</label>
                <input
                  type="text"
                  v-model="name"
                  class="form-control"
                  id="name"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div class="col-12">
                <label for="inputAddre" class="form-label small fw-semibold text-muted">Phone Number</label>
                <input
                  type="text"
                  v-model="phone"
                  class="form-control"
                  id="inputAddre"
                  placeholder="e.g. +23480xxxxxxxx"
                  required
                />
              </div>
              
              <div class="col-md-6">
                <label for="inputAddress" class="form-label small fw-semibold text-muted">Street Name</label>
                <input
                  type="text"
                  v-model="street"
                  class="form-control"
                  id="inputAddress"
                  placeholder="1234 Main St"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="inputAddress2" class="form-label small fw-semibold text-muted">Apartment / Suite</label>
                <input
                  type="text"
                  v-model="apartment"
                  class="form-control"
                  id="inputAddress2"
                  placeholder="Apartment, studio, or floor"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="inputCity" class="form-label small fw-semibold text-muted">City</label>
                <input
                  type="text"
                  v-model="city"
                  class="form-control"
                  id="inputCity"
                  required
                />
              </div>
              
              <!-- 🟢 FIXED STATE DROP DROPDOWN: Configured your option layout picker value attributes -->
              <div class="col-md-4">
                <label for="inputState" class="form-label small fw-semibold text-muted">State / Region</label>
                <select id="inputState" v-model="country" class="form-select" required>
                  <option :value="null" disabled>Choose state...</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                </select>
              </div>
              <div class="col-md-2">
                <label for="inputZip" class="form-label small fw-semibold text-muted">Zip Code</label>
                <input
                  type="text"
                  v-model="zip"
                  class="form-control"
                  id="inputZip"
                />
              </div>
              
              <div class="col-12 mt-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    v-model="isAdmin"
                    type="checkbox"
                    id="gridCheck"
                  />
                  <label class="form-check-label small fw-semibold text-secondary" for="gridCheck">
                    Request Administrative Authority Privileges (Admin)
                  </label>
                </div>
              </div>
              
              <div class="col-12 mt-4">
                <!-- 🟢 FIXED BUTTON TYPE: Changed to standard type="submit" so input tags execute required validation rules -->
                <button @click="trackSignup" type="submit" class="btn btn-submit-action w-100 fw-bold py-2 shadow-sm" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  Create Account
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

export default {
  name: "UserRegistrationForm",
  props: ["baseURL"],
  data() {
    return {
      name: "",
      email: "",
      password: "",
      phone: "",
      isAdmin: false,
      street: "",
      apartment: "",
      zip: "",
      city: "",
      country: null, // Binds to select picker dropdown
      isSubmitting: false
    };
  },
  methods: {
     trackSignup() {
      // Access the global plugin instance via "this"
      this.$gtag.event('sign_up', {
        method: 'Google',
        value: 1
      });
    },

    // 🟢 FIXED SUBMISSION METHOD: Cleaned up form capture hooks and unified API paths
    async handleSignupSubmit() {
      this.isSubmitting = true;

      const userPayload = {
        name: this.name,
        email: this.email.toLowerCase().trim(),
        password: this.password,
        phone: this.phone,
        isAdmin: this.isAdmin,
        street: this.street,
        apartment: this.apartment,
        zip: this.zip || "",
        city: this.city,
        country: this.country,
      };

      console.log("Submitting single customer role configuration registration payload:", userPayload);

      try {
        // 🟢 FIXED ENDPOINT PATH: Points straight to your base /users route to match your backend code
        await axios.post(`${this.baseURL}users`, userPayload);

        this.$swal({
          title: "Success! 🎉",
          text: "User account created successfully! Please sign in with your new credentials.",
          icon: "success",
        });

        // Clear local input fields properties safely
        this.name = "";
        this.email = "";
        this.password = "";
        this.phone = "";
        this.street = "";
        this.apartment = "";
        this.city = "";
        this.country = null;

        // Redirect browser path smoothly to your site's standard login portal view page
        this.$router.push("/login");

      } catch (err) {
        console.error("Axios user signup error block caught:", err);
        
        this.$swal({
          title: "Registration Refused",
          text: err.response?.data?.message || "Failed to finalize your user profile setup transaction rules.",
          icon: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
#signup-div {
  border: 1px solid #dee2e6;
  border-radius: 8px;
}
.btn-submit-action {
  background-color: #f0c14b;
  color: #000;
  border: 1px solid #a88734;
  transition: all 0.2s ease;
}
.btn-submit-action:hover:not(:disabled) {
  background-color: #ddb347;
}
</style>

