<template>
  <div class="card img-fluid product-card w-100">
    <div class="embed-responsive embed-responsive-10px">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
      <img :src="product.image" class="card-img-top" alt="product image" />
      </router-link>
    </div>
    <div class="card-body">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
        <h6 class="card-title">{{ product.name.substring(0, 20) }}</h6>
      </router-link>
      <p class="card-text price-text">{{ formatPrice(product.price) }}</p>
            <h6 class="card-text brand-text">
              <strong>Brand:</strong> {{ product.brand.length > 15 ? product.brand.substring(0, 15) : product.brand }}
            </h6>
      <div v-if="$route.name === 'AdminProduct'" class="mt-3 d-flex justify-content-between">
            <RouterLink :to="{ name: 'EditProduct', params: { id: product.id } }">
              <button class="btn btn-primary btn-sm">Edit</button>
            </RouterLink>
            <RouterLink :to="{ name: 'GalleryUpload', params: { id: product.id } }">
              <button class="btn btn-primary btn-sm">Upload</button>
            </RouterLink>
            <button class="btn btn-danger btn-sm" @click="deleteProduct(product.id)">Delete</button>
          </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: "ProductBox",
  data(){
    return{
       baseURL:"https://royalgoods.onrender.com/api/v1/",
     //baseURL: "http://localhost:3000/api/v1/",
    }
  },
  props:["product"],
  methods: {

    formatPrice(value){
    return new Intl.NumberFormat('en-NG',{
      style:'currency',
      currency:'NGN',
      maximumFractionDigits:2
    }).format(value);
  },

   async deleteProduct(){
  if(!confirm('are you sure you want to delete this product?'))return;

  try{
    await axios.delete(`${this.baseURL}products/${this.product.id}`,{
      headers:{Authorization:`Bearer ${localStorage.getItem("token")}`

      }
    });
    this.$emit("product-deleted",this.product.id);
    this.$swal({
             text:"Product deleted successfully",
             icon:"success"
              });
  }catch(err){
    console.error('Error deleting product:', err)
    this.$swal({
             text:"Failed to delete product!",
             icon:"error"
              });
  }
}

  },
  
};
</script>

<style scoped>

.product-card {
  border: 1px solid #ddd;
  transition: transform 0.2s ease;
}
.product-card:hover {
  transform: scale(1.02);
}
.product-img {
  max-width: 100%;
  height: 200px;
  object-fit: cover;
}
.price-text {
  color: #444;
  font-weight: 600;
}
.brand-text {
  font-size: 0.9rem;
  color: #444;
}
a{
  text-decoration: none;
  color:#000
}
</style>