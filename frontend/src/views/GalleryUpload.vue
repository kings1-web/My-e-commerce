<template>
  <div class="container mt-4">
    <h3>Upload Gallery Images</h3>
    <form @submit.prevent="uploadGalleryImages">
      <div class="mb-3">
        <input
          type="file"
          class="form-control"
          multiple
          @change="handleFiles"
        />
      </div>
      <button type="submit" class="btn btn-primary">Upload</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      selectedFiles: [],
    };
  },
  computed: {
    productId() {
      return this.$route.params.id;
    },
  },
  props: ["baseURL"],
  methods: {
    handleFiles(event) {
      this.selectedFiles = event.target.files;
    },
    async uploadGalleryImages() {
      // 🟢 FIXED: Check the .length property of the FileList/Array
      if (!this.selectedFiles || this.selectedFiles.length === 0) {
        this.$swal({
          text: "Please select at least one image",
          icon: "warning",
          closeOnClickOutside: false,
        });
        return;
      }
      
      const formData = new FormData();
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append("images", this.selectedFiles[i]);
      }
      
      try {
        const response = await axios.put(
          `${this.baseURL}products/gallery-images/${this.productId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.$swal({
          text: "Images uploaded successfully",
          icon: "success",
        });
        
        console.log(response.data);
        this.$router.push({ name: "AdminProduct" });
      } catch (err) {
        console.error("Upload error details:", err.response ? err.response.data : err.message);
        this.$swal({
          text: "Image upload failed",
          icon: "warning",
        });
      }
    },
  },
};
</script>
