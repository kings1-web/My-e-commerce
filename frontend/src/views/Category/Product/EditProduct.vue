<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12 text-center">
        <h4 class="pt-3">Edit Product</h4>
      </div>
    </div>
    <div class="row">
      <div class="col-3"></div>
      <div class="col-6">
        <form class="row g-3 col-12 text-start py-4" v-if="product">
          <div class="form-group">
            <label>Category</label>
            <select class="form-select" v-model="product.category.id" required>
              <option
                v-for="category of categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <div class="form-group col-6">
              <label>name</label>
              <input
                input="text"
                class="form-control"
                v-model="product.name"
                require
              />
            </div>
            <div class="form-group">
              <label>discription</label>
              <input
                type="text"
                class="form-control"
                v-model="product.discription"
                require
              />
            </div>
            <div class="form-group">
              <label>Rich Discription</label>
              <textarea
                class="form-control"
                row="3"
                v-model="product.richDiscription"></textarea>
            </div>
            <div class="form-group">
              <label>update your file</label><br />
              <input
                type="file"
                ref="image"
                name="image"
                @change="handleFileUpload"
                class="form-control-file"
                require
              />
            </div>
            <div class="form-group">
              <label>Afflliate link</label>
              <input
                type="text"
                class="form-control"
                v-model="product.brand"
                require
              />
            </div>
            <div class="form-group">
              <label>price</label>
              <input
                type="number"
                class="form-control"
                v-model="product.price"
                require
              />
            </div>
            <div class="form-group">
              <label>countInStock</label>
              <input
                type="number"
                class="form-control"
                v-model="product.countInStock"
                require
              />
            </div>
            <div class="form-group">
              <label>raring</label>
              <input
                type="number"
                class="form-control"
                v-model="product.rating"
                require
              />
            </div>
            <div class="form-group">
              <label>numReviews</label>
              <input
                type="number"
                class="form-control"
                v-model="product.numReviews"
                require
              />
            </div>
            <div class="form-group">
              <label>isFeature</label>
              <input
                type="text"
                class="form-control"
                v-model="product.isFeature"
                require
              />
            </div>
          </div>
          <button type="button" class="btn btn-primary" @click="EddProduct()">
            ADD PRODUCT
          </button>
        </form>
      </div>
      <div class="col-3"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      product: null,
      id: null,
    };
  },
  props: ["baseURL", "categories", "products"],

  methods: {
    handleFileUpload(event) {
      this.file = this.$refs.image.files[0];
    },
    async EddProduct() {
      const formData = new FormData();

      formData.append("name", this.product.name);
      formData.append("category", this.product.category.id);
      formData.append("discription", this.product.discription);
      formData.append("richDiscription", this.product.richDiscription);
      formData.append("image", this.$refs.image.files[0]);
      formData.append("brand", this.product.brand);
      formData.append("price", this.product.price);
      formData.append("countInStock", this.product.countInStock);
      formData.append("rating", this.product.rating);
      formData.append("numReviews", this.product.numReviews);
      formData.append("feature", this.product.feature);

      console.log("category", this.product.category.id);

      await axios
        .put(`${this.baseURL}products/${this.id}`, formData,{
          headers:{
            Authorization:`Bearer ${localStorage.getItem('token')}`
          }
        })
        .then(() => {
          this.$emit("fetchData");
          this.$router.push({ name: "AdminProduct" });
          this.$swal({
            text: "PRODUCT UPDATED SUCCESSFULLY",
            icon: "success",
          });
        })
        .catch((err) => console.log("err", err));
    },
  },

  mounted() {
    this.id = this.$route.params.id;
    this.product = this.products.find((product) => product.id == this.id);
  },
};
</script>
