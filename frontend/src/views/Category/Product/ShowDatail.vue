<template>
  <div class="container">
    <div class="row pt-5">
      <div class="col-md-1"></div>
      <!--display image-->
      <div class="col-md-4 col-12">
        <img :src="product.image" class="img-fluid" />
      </div>
      <!--disply product detail-->
      <div class="col-md-6 col-12 pt-3 pt-md-0">
        <h4>{{ product.name }}</h4>
        <h6 class="category fst-italic">{{ category.name }}</h6>
        <h6 class="fw-bold">price {{ product.price }}</h6>
        <p class="text-capitalize">
          {{ product.discription }}
        </p>
        <div class="d-flex flex-row justify-content-between">
          <div class="input-group col-md-3 col p-0">
            <div class="input-group-">
              <span class="input-group-text">quantity</span>
            </div>
            <div class="col-6">
              <input type="number" class="form-control"  v-model="quantity" min="1"/>
            </div>
        </div>
          <div class="input-group col-md-3 col p-0" >
          
            <button class="btn" 
            id="add-to-cart-button" 
            @click="addProductToCart(product)">
              Add to Cart
            </button>
            </div>
          </div>
        <div class="features pt-3 text-capitalize">
          <h5><strong>features</strong></h5>
          <ul>
          <li style="white-space: pre-line;">{{ product.richDiscription }} </li>
            
          </ul>
        </div>
       
      </div>
    </div>
  </div>
</template>

<script>
import {useCartStore} from '@/stores/CartStore';
import axios from "axios";
export default {
  data(){
    return {
      product:{},
     category: {},
     token:null,
      quantity:1,
    }
  },

 
 
      props: ["baseURL","categories","products"],
      
   methods: {
    addProductToCart(product){
     if(!this.token){
      this.$swal({
        text:"please login to add item",
        icon:"error"
      });
      return;
     
    }
     //add to cart
     const CartStore=useCartStore();
     const qty = this.quantity > 0 ? this.quantity : 1;
       CartStore.addToCart(product, qty);
       this.$swal({
             text:"Product added to cart successfully!",
             icon:"success"
              });
      // alert('Product added to cart!')
    },
    checkout(){
      this.$router.push({name:'BillingAddress'})
    }
   
   },
      mounted() {
        
     this.id = this.$route.params.id;
     this.product = this.products.find((product) => product?.id == this.id);
     this.category = this.categories.find(
      (category) => category.id == this.product.category?.id);
     this.token = localStorage.getItem("token");
      },
    
  }
</script>
<style scoped>
.category {
  font-weight: 400;
}
#wishlist-button {
  background-color: #b9b9b9;
}
#add-to-cart-button {
  background-color:orangered;
}
.form-control{
  width:4;
}
</style>
