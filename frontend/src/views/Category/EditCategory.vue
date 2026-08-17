<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-8 col-lg-6 mx-auto">
        <div class="card shadow-sm border-0 rounded-3">
          <div class="card-header bg-dark text-white text-center py-3">
            <h4 class="mb-0">Edit Category</h4>
          </div>

          <div class="card-body p-4">
            <form v-if="category" @submit.prevent="editCategory">
              <!-- Category Name -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Category Name</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="category.name"
                  required
                />
              </div>

              <!-- Icon / Short Description -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Icon Class / Short Description</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="category.icon"
                  required
                />
              </div>

              <!-- Color Picker / Text -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Theme Color</label>
                <input
                  type="color"
                  class="form-control form-control-color w-100"
                  v-model="color"
                />
              </div>

              <!-- Image Upload -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Update Image (Optional)</label>
                <input
                  type="file"
                  class="form-control"
                  ref="image"
                  @change="handleFileUpload"
                  accept="image/*"
                />
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                :disabled="isSubmitting"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Save Changes
              </button>
            </form>

            <div v-else class="text-center py-4 text-muted">
              Loading category data...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EditCategory",
  props: {
    baseURL: {
      type: String,
      required: true,
    },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      category: null,
      id: null,
      file: null,
      color: "#000000",
      isSubmitting: false,
    };
  },
  watch: {
    categories: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.length > 0 && !this.category) {
          this.setCategoryData();
        }
      },
    },
  },
  methods: {
    handleFileUpload() {
      if (this.$refs.image.files && this.$refs.image.files[0]) {
        this.file = this.$refs.image.files[0];
      }
    },

    setCategoryData() {
      this.id = this.$route.params.id;
      const matched = this.categories.find(
        (c) => c.id == this.id || c._id == this.id
      );

      if (matched) {
        this.category = { ...matched };
        this.color = matched.color || "#000000";
      }
    },

    async editCategory() {
      this.isSubmitting = true;

      try {
        const formData = new FormData();
        formData.append("name", this.category.name);
        formData.append("icon", this.category.icon || "");
        formData.append("color", this.color);

        if (this.file) {
          formData.append("image", this.file);
        }

        const token = localStorage.getItem("token");

        await axios.put(`${this.baseURL}categories/${this.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        this.$emit("fetchData");
        this.$router.push({ name: "Category" });

        if (this.$swal) {
          this.$swal({
            text: "Category updated successfully!",
            icon: "success",
          });
        }
      } catch (err) {
        console.error("Error updating category:", err);
        const errorMsg =
          err.response?.data?.message || "Failed to update category.";
        
        if (this.$swal) {
          this.$swal({
            text: errorMsg,
            icon: "error",
          });
        } else {
          alert(errorMsg);
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
  mounted() {
    this.setCategoryData();
  },
};
</script>

<style scoped>
.form-control-color {
  height: 38px;
}
</style>