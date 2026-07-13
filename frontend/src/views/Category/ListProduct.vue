<template>
  <div class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h4 class="pt-3">{{ category?.name || "Category" }}</h4>
        <h5 style="font-weight:300; color:#686868">{{ msg }}</h5>
      </div>
    </div>

    <div class="row">
      <div
        v-for="product in productsList"
        :key="product._id"
        class="col-md-6 col-xl-4 col-12 pt-3 d-flex justify-content-around"
      >
        <ProductBox :product="product" />
      </div>
    </div>
  </div>
</template>

<script>
import ProductBox from "@/components/CategoryBox/ProductBox.vue";

export default {
  components: { ProductBox },

  props: ["categories", "baseURL", "products"],

  data() {
    return {
      id: null,
      category: {},
      productsList: [],
      msg: "",
    };
  },

  mounted() {
    this.id = String(this.$route.params.id);
    this.initializeData();
  },

  watch: {
    products: {
      handler: "initializeData",
      deep: true,
    },
    categories: {
      handler: "initializeData",
      deep: true,
    },
    "$route.params.id"(newId) {
      this.id = String(newId);
      this.initializeData();
    },
  },

  methods: {
    initializeData() {
      // Prevent crash if props not ready
      if (!this.products || !this.categories) return;

      // ✅ Find category using _id
      this.category =
        this.categories.find(
          (c) => String(c._id) === String(this.id)
        ) || {};

      // ✅ Filter products using category._id
      this.productsList = this.products.filter(
        (p) => String(p.category?._id) === String(this.id)
      );

      // ✅ Message logic
      if (this.productsList.length === 0) {
        this.msg = "No product found";
      } else if (this.productsList.length === 1) {
        this.msg = "Only 1 product found";
      } else {
        this.msg = `${this.productsList.length} products found`;
      }

     
    },
  },
};
</script>