<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow border-0 p-4">
          <h3 class="card-title text-center mb-4 fw-bold text-primary">
            Installer Registration 👨‍🔧
          </h3>

          <form @submit.prevent="handleRegister" enctype="multipart/form-data">
            <!-- Profile Picture Upload Widget -->
            <div class="text-center mb-4">
              <div class="position-relative d-inline-block">
                <img
                  :src="imagePreview || '/default-avatar.png'"
                  alt="Profile Preview"
                  class="rounded-circle border img-thumbnail object-fit-cover shadow-sm"
                  style="width: 120px; height: 120px; object-fit: cover"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-dark position-absolute bottom-0 end-0 rounded-circle"
                  @click="triggerFileSelect"
                  style="width: 32px; height: 32px; padding: 0"
                  title="Upload Photo"
                >
                  📸
                </button>
              </div>
              <input
                type="file"
                ref="fileInput"
                @change="onFileSelected"
                accept="image/*"
                class="d-none"
              />
              <div class="small text-muted mt-2">
                Upload profile photo (Optional)
              </div>
            </div>

            <!-- Name Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="John Doe"
                required
              />
            </div>

            <!-- Email Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="installer@example.com"
                required
              />
            </div>

            <!-- Password Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="form-control"
                placeholder="••••••••"
                required
              />
            </div>

            <!-- Phone Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Phone Number</label>
              <input
                v-model="form.phone"
                type="tel"
                class="form-control"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <!-- Location Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Location / City</label>
              <input
                v-model="form.location"
                type="text"
                class="form-control"
                placeholder="New York, NY"
                required
              />
            </div>

            <!-- Dynamic Skills/Tags Input Block -->
            <div class="mb-4">
              <label class="form-label fw-semibold">Skills / Specialties</label>
              <div class="input-group mb-2">
                <input
                  v-model="newSkill"
                  type="text"
                  class="form-control"
                  placeholder="e.g. CCTV, Solar, Electrical"
                  @keydown.enter.prevent="addSkill"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="addSkill"
                >
                  Add
                </button>
              </div>
              <!-- Bootstrap Badges for tags -->
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="(skill, index) in form.skills"
                  :key="index"
                  class="badge bg-secondary d-flex align-items-center gap-2 px-3 py-2 fs-7"
                >
                  {{ skill }}
                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    style="font-size: 0.6rem"
                    @click="removeSkill(index)"
                  ></button>
                </span>
                <div
                  v-if="form.skills.length === 0"
                  class="small text-muted italic"
                >
                  No skills added yet. Press Enter to add.
                </div>
              </div>
            </div>

            <!-- Form Submission Button -->
            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary py-2 fw-bold"
                :disabled="isSubmitting"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                {{
                  isSubmitting ? "Creating Account..." : "Register as Installer"
                }}
              </button>
              <router-link
                to="/installer-login"
                class="btn btn-link text-center text-decoration-none mt-2 small"
              >
                Already have an account? Sign In
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useInstallerStore } from "@/stores/installer";

export default {
  name: "InstallerRegister",
 props: {
    baseURL: { type: String, required: true }
  },
  data() {
    return {
      store: useInstallerStore(),
      //baseURL: "http://localhost:3000/api/v1/",
      form: {
        name: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        skills: [],
      },
      newSkill: "",
      selectedFile: null,
      imagePreview: null,
      isSubmitting: false,
    };
  },
  methods: {
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    addSkill() {
      const cleanSkill = this.newSkill.trim();
      if (cleanSkill && !this.form.skills.includes(cleanSkill)) {
        this.form.skills.push(cleanSkill);
        this.newSkill = ""; // Clear input field
      }
    },
    removeSkill(index) {
      this.form.skills.splice(index, 1);
    },
    async handleRegister() {
      this.isSubmitting = true;

      // Setup Multipart Form Data to handle file transfers cleanly
      const formData = new FormData();
      formData.append("name", this.form.name);
      formData.append("email", this.form.email);
      formData.append("password", this.form.password);
      formData.append("phone", this.form.phone);
      formData.append("location", this.form.location);

      // Append the profile picture file if selected
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      // Arrays must be appended element-by-element or stringified for multiform parsing
      this.form.skills.forEach((skill) => {
        formData.append("skills[]", skill);
      });

      try {
        await this.store.register(this.baseURL, formData);
         this.$swal({
          text: "Registration successfully",
          icon: "success",
        });
        this.$router.push("/installer-login");
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Something went wrong.";
         this.$swal({
          text: "Registration Fail",
          icon: "success",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>
