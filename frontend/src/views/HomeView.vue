<template>
  <div id="home">
    <div class="container">
 <CategorySlider
      :categories="categories"
    />

    </div>
  

<!-- featured product-->
 <div class="container py-2">
        <div class="text-white pt-2 py-2 rounded mt-2" style="background-color:orangered;">
          <h3>Feature Product</h3>
        </div>
    
        <div class="card-body py-2">
          <FeaturedCarousel :baseURL="baseURL" :count="60" />
        </div>
        </div>
    <!--display top category-->
    <div class="container">
      
        <div class="text-white pt-2 py-2 rounded mt-2" style="background-color: purple;">
          <h3 id="start-shopping">Top Category</h3>
        </div>

<select class="form-select-lg" v-on:change="category" required>
          <option selected>Shop by Category</option>
          <option
            v-for="category of categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>


      <div class="row">
        <div
          v-for="(category, index) in latestCategories"
          :key="index"
          class="col-md-6 col-xl-3 col-6 pt-3 justify-content-around d-flex"
        >
          <CategoryBox :category="category" />
        </div>
      </div>
    </div>
    <!--display top product-->
    <div class="container py-2">
      
        <div class="text-white bg-primary pt-2 py-2 rounded">
          <h3 id="shop-now">Top Product</h3>
        </div>
    

      <div class="row">
        <div
          v-for="(product, index) in latestProducts"
          :key="index"
          class="col-md-6 col-xl-3 col-6 pt-3 justify-content-around d-flex"
        >
          <ProductBox :product="product" />
        </div>
      </div>

    </div>

    



    <div style="z-index: 2;color:brown;font-size:60px;padding:25px" class="text-end fixed-bottom">
      <a href="https://wa.link/3pxzcs"><i class="bi bi-whatsapp"></i></a>
    </div>
  </div>

</template>

<script>
import CategorySlider from "@/components/CategorySlider.vue";
import FeaturedCarousel from "@/components/FeaturedCarousel.vue";
import ProductBox from "@/components/CategoryBox/ProductBox.vue";
import CategoryBox from "@/components/CategoryBox/CategoryBox.vue";

export default {
  name: "Home",
  components: { CategoryBox, ProductBox, FeaturedCarousel,CategorySlider },
  props: ["categories", "products", "baseURL"],
  data() {
    return {
      categorySize: 8,
      productSize: 8,
    };
  },
  methods: {
    category(e) {
      e.preventDefault();
      this.$router.push("/category/show/" + e.target.value);
    },
  },
  computed: {
    latestCategories() {
      return [...this.categories].reverse().slice(0, this.categorySize);
    },
    latestProducts() {
      return [...this.products].reverse().slice(0, this.productSize);
    },
  },

  mounted() {
    this.categorySize = Math.min(8, this.categories.length);
    this.productSize = Math.min(8, this.products.length);
  },
};
</script>

<style scoped>
.page-holder {
  min-height: 90vh;
}
.bg-cover {
  background-size: 100% 100% !important;
}
a{
  color: purple;
}
.lead{
  background-color: purple;
}
#heading {
  font-weight: 400;
}
#background-div {
  background: url("https://t3.ftcdn.net/jpg/07/15/23/76/360_F_715237623_WhO9EcIUBx1IshiL9fLTP2LmpAOBGGIx.jpg");
}
.form-select-lg:hover {
  cursor: pointer;
  color: orange;
}
.form-select-lg {
  background-color: purple;
  color: white;
  max-width: 100%;
}
</style>
