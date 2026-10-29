<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow border-0 p-4 bg-white rounded-3">
          <div class="text-center mb-4">
            <h3 class="fw-bold text-dark mb-1">Join as a Professional Installer</h3>
            <p class="text-muted small">Fill out your details to join our vetted technician marketplace network.</p>
          </div>

          <form @submit.prevent="handleInstallerRegistration">
            <!-- Full Name -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Full Name</label>
              <input type="text" v-model="form.name" class="form-control" placeholder="John Doe" required />
            </div>

            <!-- Email Address -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Email Address</label>
              <input type="email" v-model="form.email" class="form-control" placeholder="johndoe@example.com" required />
            </div>

            <!-- Phone Number -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Phone Number</label>
              <input type="tel" v-model="form.phone" class="form-control" placeholder="e.g., +2348012345678" required />
            </div>

            <!-- Location/City -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Operating Location / City</label>
              <input type="text" v-model="form.location" class="form-control" placeholder="e.g., Ikeja, Lagos" required />
            </div>

            <!-- Skills -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Skills / Specializations</label>
              <input type="text" v-model="skillsInput" class="form-control" placeholder="e.g., Solar setups, CCTV, Inverters" required />
              <div class="form-text text-muted" style="font-size: 0.72rem;">Separate skills with commas.</div>
            </div>

            <!-- 🟢 NEW FIELD: Bank Settlement Dropdown -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Settlement Bank</label>
              <select v-model="form.settlementBank" class="form-select" :disabled="loadingBanks" required>
                <option value="" disabled>Select your bank</option>
                <option v-for="bank in banksList" :key="bank.id" :value="bank.code">
                  {{ bank.name }}
                </option>
              </select>
              <div v-if="loadingBanks" class="form-text text-primary small">Fetching active bank network list...</div>
            </div>

            <!-- 🟢 NEW FIELD: Bank Account Number -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">NUBAN Account Number</label>
              <input 
                type="text" 
                v-model="form.accountNumber" 
                class="form-control" 
                placeholder="10-digit Account Number" 
                maxlength="10"
                pattern="\d{10}"
                required 
              />
              <div class="form-text text-muted" style="font-size: 0.72rem;">Must be exactly 10 digits.</div>
            </div>

            <!-- Profile Password -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Password</label>
              <input type="password" v-model="form.password" class="form-control" placeholder="••••••••" required />
            </div>

            <!-- Profile Picture File Upload -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-muted">Upload Profile Picture</label>
              <input type="file" ref="imageInput" class="form-control" accept="image/*" @change="handleFileChange" required />
              
              <!-- Local preview wrapper -->
              <div v-if="imagePreview" class="mt-2 text-center">
                <img :src="imagePreview" class="img-thumbnail rounded-circle object-fit-cover" style="width: 80px; height: 80px;" alt="Preview" />
              </div>
            </div>

            <!-- Submit Action Button -->
            <button type="submit" class="btn btn-primary w-100 fw-bold py-2 shadow-xs" :disabled="isSubmitting || loadingBanks">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              Submit Application
            </button>
          </form>
          
          <div class="text-center mt-3">
            <small class="text-muted">Already have an account? <router-link to="/login" class="text-primary text-decoration-none fw-semibold">Sign In</router-link></small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "InstallerRegistrationView",
  data() {
    return {
      form: {
        name: "",
        email: "",
        phone: "",
        location: "",
        settlementBank: "", // 🟢 Captured for Paystack Subaccount
        accountNumber: "",  // 🟢 Captured for Paystack Subaccount
        password: ""
      },
      skillsInput: "",
      selectedFile: null,
      imagePreview: null,
      isSubmitting: false,
      banksList: [],       // 🟢 Holds banks returned by Paystack API
      loadingBanks: false  // 🟢 Status tracker for bank fetch
    };
  },
  mounted() {
    // Automatically load all valid payment banks as soon as the page opens
    this.fetchNigerianBanks();
  },
  props: ["baseURL"],
  methods: {
    // 🟢 Fetch live, supported banks directly using Paystack's endpoint via proxy or open library
    async fetchNigerianBanks() {
      this.loadingBanks = true;
      try {
        // Fetch through Paystack API (requires no authentication headers for public bank query lists)
        const response = await axios.get(`${this.baseURL}payments/banks`); //
        // Sort alphabetically for clean user browsing layout
        this.banksList = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
      } catch (err) {
        console.error("Failed to load Paystack banks mapping:", err);
        // Fallback local list array if the server drops connection unexpectedly
        this.banksList = [
          { name: "Access Bank", code: "044" },
          { name: "Ecobank Nigeria", code: "050" },
          { name: "Fidelity Bank", code: "070" },
          { name: "First Bank of Nigeria", code: "011" },
          { name: "First City Monument Bank", code: "214" },
          { name: "Guaranty Trust Bank", code: "058" },
          { name: "Moniepoint MFB", code: "50515" },
          { name: "OPay Digital Services", code: "999992" },
          { name: "Stanbic IBTC Bank", code: "221" },
          { name: "Sterling Bank", code: "232" },
          { name: "United Bank For Africa", code: "033" },
          { name: "Wema Bank", code: "035" },
          { name: "Zenith Bank", code: "057" }
        ];
      } finally {
        this.loadingBanks = false;
      }
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("Max allowed image footprint is 5MB!");
          this.$refs.imageInput.value = "";
          return;
        }
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    async handleInstallerRegistration() {
      this.isSubmitting = true;

      try {
        const skillsArray = this.skillsInput.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);

        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("email", this.form.email.toLowerCase().trim());
        formData.append("phone", this.form.phone);
        formData.append("location", this.form.location);
        formData.append("password", this.form.password);
        
        // 🟢 Append the new routing variables safely to FormData
        formData.append("settlementBank", this.form.settlementBank);
        formData.append("accountNumber", this.form.accountNumber);
        
        if (this.selectedFile) formData.append("image", this.selectedFile);
        
        skillsArray.forEach(skill => formData.append("skills", skill));

        // Sends data directly to your backend endpoint router logic
        const res = await axios.post(`${this.baseURL}installers/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.$swal({
          title: "Application Received! 🎉",
          text: res.data.message || "Your profile has been submitted for admin review.",
          icon: "success"
        });

        this.$router.push("/login");

      } catch (err) {
        console.error("Installer sign up failure:", err);
        this.$swal({
          title: "Registration Failed",
          text: err.response?.data?.message || "Could not complete account creation process.",
          icon: "error"
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.object-fit-cover { object-fit: cover; }
</style>
