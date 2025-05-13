<template>
  <div id="home">
    <div id="background-div" class="page-holder bg-cover">
      <div class="container py-5">
        <header class="text-start text-white py-5">
          <h3 class="mb-4 rounded" id="heading">
            <a href="#start-shopping" class="bg-white pt-2 py-2 rounded">
              start shopping 
            </a>
          </h3>
          <p class="lead mb-0 bg-dark p-1 rounded">ROYAL-GOODS </p>
        </header>
        <select class="form-select-lg" v-on:change="category" required>
          <option selected>Shop by Category</option>
                        <option v-for="category of categories"
                        :key="category.id"
                        :value="category.id">{{ category.name }} </option>
                    </select> 
        </div>
  
          <div style="text-align: center; top: 100px; background-color:orangered;height: px;">
            <button type="button"   id="btn"><a class="btn btn- mb-0  text-skyblue" href="#shop-now"><h3>Shop Now</h3></a></button>
        </div>
      
      </div>
  <!--display top category-->
          <div class="container">
            <div class="row">
              <div class="col-12 text-center">
                <h2 class="pt-3" id="start-shopping">Top Category</h2>
              </div>
            </div>
            <div class="row">
              <div v-for="(category, index) in latestCategories" :key="index" 
              class="col-md-6 col-xl-3 col-6 pt-3 justify-content-around d-flex">
           <CategoryBox :category="category"/>
          </div>
          </div>
        </div>
        <!--display top product-->
        <div class="container py-2">
          <div class="row">
              <div class="col-12 text-center">
                <h2 class="pt-3" id="shop-now">Top Product</h2>
              </div>
              </div>
            
        <div class="row">
              <div v-for="(product, index) in latestProducts" :key="index" 
              class="col-md-6 col-xl-3 col-6 pt-3 justify-content-around d-flex">
           <ProductBox :product="product"/>
            </div>
          </div>
           <div class="card mb-4 shadow-sm">
        <div class="card-header bg-primary text-white ">
          <h5>Featured Products</h5>
        </div>
        
        <div class="card-body">
    <FeaturedCarousel :baseURL="baseURL" :count="20" />
  </div>
        </div>
        </div>
        
    <div style="z-index:2" class="text-end fw-bold fs-1 sticky-bottom"><i style="color:brown;" class="bi bi-chat-dots"><a style="color:brown" href="https://wa.link/3pxzcs"></a></i></div>
  </div>
 
    
</template>

<script>
import FeaturedCarousel from '@/components/FeaturedCarousel.vue';
import ProductBox from "@/components/CategoryBox/ProductBox.vue";
import CategoryBox from "@/components/CategoryBox/CategoryBox.vue";

export default {
  name: "Home",
  components: { CategoryBox, ProductBox,FeaturedCarousel  },
  props: ["categories", "products", "baseURL"],
  data() {
    return {
      categorySize: 8,
      productSize: 12,
    };
  },
  methods:{
    category(e){
      e.preventDefault();
      this.$router.push('/category/show/' + e.target.value )
    },
  },
computed:{
  latestCategories(){
    return [...this.categories].reverse().slice(0, this.categorySize);
  },
  latestProducts(){
    return [...this.products].reverse().slice(0, this.productSize)
  }
},
  
  mounted() {
    this.categorySize = Math.min(8, this.categories.length);
    this.productSize = Math.min(20, this.products.length);

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
#heading {
  font-weight: 400;
}
#background-div {
  background: url("https://t3.ftcdn.net/jpg/07/15/23/76/360_F_715237623_WhO9EcIUBx1IshiL9fLTP2LmpAOBGGIx.jpg");
}
.form-select-lg:hover{
  cursor: pointer;
}
.form-select-lg{
  background-color: orangered;
  color: white;
}


</style>
