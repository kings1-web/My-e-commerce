<template>
  <div class="card img-fluid">
    <div class="embed-responsive embed-responsive-10px">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
      <img :src="product.image" class="card-img-top" alt="product image" />
      </router-link>
    </div>
    <div class="card-body">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
        <h5 class="card-title text-capitalize">{{ product.name.substring(0, 25) }}</h5>
      </router-link>
      <p style="color:blue-sky;" class="card-text text-wrap">₦{{ product.price }}</p>
      <h6 style="font-weight: 900;" class="card-text text-wrap">BRAND:{{ product.brand.substring(0,15) }}</h6>
      <div class="d-flex justify-content-between mt-3">
      <RouterLink
        :to="{ name: 'EditProduct', params: { id: product.id } }"
        v-show="$route.name == 'AdminProduct'"
      >
        <button class="btn btn-primary">Edit</button>
      </RouterLink>
      <button class="btn btn-danger ml-2" @click="deleteProduct()" v-show="$route.name == 'AdminProduct'">
            DELETE
          </button>
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
.card-img-top {
  object-fit: cover;
  max-width: 100%;
  max-height: 300px;
}
a {
  text-decoration: none;
}
.card-title {
  color: #484848;
}
.card-title:hover {
  color: orangered;
}
.card-body {
  margin-bottom: -5px;
  line-height: 0;
}
p #bg{
  background:red;
  font-size: 20px;
}
</style>
