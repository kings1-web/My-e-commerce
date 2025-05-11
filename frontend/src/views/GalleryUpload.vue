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
      if (!this.selectedFiles) {
        this.$swal({
          text: "Please select atleast one image",
          icon: "warning",
          closeOnClickOutside: false,
        });
        return;
      }
      const formData = new FormData();
      for (let I = 0; I < this.selectedFiles.length; I++) {
        formData.append("images", this.selectedFiles[I]);
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
      this.$router.push({name :"AdminProduct"});
        this.$swal({
          text: "Image uploaded sucessfully",
          icon: "success",
        });
        console.log(response.data);
      } catch (err) {
        console.error(err);
        this.$swal({
          text: "Image upload failed",
          icon: "warning",
        });
      }
    },
  },
};
</script>
