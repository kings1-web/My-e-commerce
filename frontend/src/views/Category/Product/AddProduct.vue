<template>
  <div class="container bg-dark text-white mt-4 py-4">
    <div class="row">
      <div class="col-12 text-center mb-3">
        <h4>Add New Product</h4>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-8 col-12">
        <form @submit.prevent="addProduct" class="row g-3 text-start">
          <!-- CATEGORY -->
          <div class="form-group col-12">
            <label class="form-label">Category</label>
            <select class="form-select" v-model="category" required>
              <option disabled value="">Select a Category</option>
              <option
                v-for="cat in categories"
                :key="cat.id || cat._id"
                :value="cat.id || cat._id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- NAME -->
          <div class="form-group col-12 text-capitalize">
            <label class="form-label">Name</label>
            <input type="text" v-model="name" class="form-control" required />
          </div>

          <!-- DESCRIPTION -->
          <div class="form-group col-12">
            <label class="form-label">Description</label>
            <input type="text" v-model="discription" class="form-control" required />
          </div>

          <!-- PRODUCT FEATURES / RICH DESCRIPTION -->
          <div class="form-group col-12">
            <label class="form-label">Product Features</label>
            <textarea
              class="form-control"
              rows="3"
              v-model.trim="richDiscription"
            ></textarea>
          </div>

          <!-- IMAGE -->
          <div class="form-group col-12">
            <label class="form-label">Image</label>
            <input
              type="file"
              ref="image"
              name="image"
              @change="handleFileUpload"
              class="form-control"
              accept="image/*"
              required
            />
          </div>

          <!-- BRAND -->
          <div class="form-group col-12">
            <label class="form-label">Brand</label>
            <input type="text" v-model="brand" class="form-control" />
          </div>

          <!-- PRICE -->
          <div class="form-group col-md-6 col-12">
            <label class="form-label">Price (₦)</label>
            <input type="number" v-model="price" class="form-control" required />
          </div>

          <!-- OLD PRICE (FOR DISCOUNT BADGE) -->
          <div class="form-group col-md-6 col-12">
            <label class="form-label">Old Price (₦)</label>
            <input type="number" v-model="oldPrice" class="form-control" placeholder="Optional" />
          </div>

          <!-- COUNT IN STOCK -->
          <div class="form-group col-12">
            <label class="form-label">Count In Stock</label>
            <input type="number" v-model="countInStock" class="form-control" required min="0" />
          </div>

          <!-- IS FEATURED -->
          <div class="form-group col-12">
            <label class="form-label">Featured Product</label>
            <select v-model="isFeatured" class="form-select">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>

          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-primary w-100">ADD PRODUCT</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddProduct",
  props: ["baseURL", "products", "categories"],

  data() {
    return {
      category: "",
      name: "",
      discription: "",
      richDiscription: "",
      image: null,
      brand: "",
      price: "",
      oldPrice: "",
      countInStock: 0,
      isFeatured: false,
    };
  },

  methods: {
    handleFileUpload(event) {
      this.image = event.target.files[0];
    },

    async addProduct() {
      if (!this.image) {
        this.$swal({
          text: "Please select an image file first",
          icon: "warning",
          closeOnClickOutside: false,
        });
        return;
      }

      const formData = new FormData();
      formData.append("name", this.name);
      formData.append("category", this.category);
      formData.append("discription", this.discription);
      formData.append("richDiscription", this.richDiscription || "");
      formData.append("image", this.image);
      formData.append("brand", this.brand || "");
      formData.append("price", this.price);
      formData.append("oldPrice", this.oldPrice || 0); // 🟢 Match backend key
      formData.append("countInStock", this.countInStock);
      formData.append("isFeatured", this.isFeatured); // 🟢 Corrected key to match backend

      try {
        await axios.post(`${this.baseURL}products/`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        this.$emit("fetchData");
        this.$router.push({ name: "AdminProduct" });
        this.$swal({
          text: "Product added successfully!",
          icon: "success",
          closeOnClickOutside: false,
        });
      } catch (err) {
        console.error("Add Product Error:", err);
        this.$swal({
          text: err.response?.data || "Failed to add product",
          icon: "error",
        });
      }
    },
  },
};
</script>