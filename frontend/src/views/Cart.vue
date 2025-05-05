<template>
  
  <div class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h3 class="pt-3">
          Shopping Cart
        </h3>
      </div>
      <!--loop over the item and display-->
      <div v-if="token">
        <div v-for="item in cart" 
        :key="item.id"
        class="row mt-2 pt-3 justify-content-around"
        >
       <div class="col-2"></div>
       <div class="col-md-3 embde-responsive embed-responsive-16by9  ">
        <img :src="item.image" alt="beatiful product" class=" card-image-top
        w-100 embed-responsive embed-responsive-item"
        style="object-fit:cover;"/>
       </div>
       <!--display product name, quantity-->
       <div class="col-md-5 px-3">
        <div class="card-block px-3">
          <h6 class="card-title">

            <RouterLink :to="{name: 'ShowDetails',params:{id:item.id}}">
              {{ item.name }}
           
          </RouterLink>
          </h6>
          <p class="mb-0 fw-bold" id="iitem-price">
             {{ formatPrice(item.price) }} per unit
          </p>
          <p class="m-0">
            Quantity:{{ item.quantity }}
          </p>
        </div>
           <p class="mb-0" style="float:right">
            Total: <span class="fw-bold">
              ₦ {{ item.price * item.quantity }}
            </span>
           </p>
          <a href="#" clsss="text-end" @click="removeItem(item.id)">Remove From Cart</a>
           <br/><br/>
           <RouterLink :to="{name: 'ShowDetails',params:{id:item.id}}">
           EddIt Cart
          </RouterLink>

      </div>
      <div class="col-12">
          <div class="col-12"><hr /></div>
        </div>
      <!-- display the price-->
       
      </div>
      <div class="total-cost pt-2 text-end">
      <h5>Total: {{ formatPrice(totalPrice) }}</h5>
      <button class="btn btn-primary confirm" style="overflow: auto;"
       @click="checkout">
       proceed for payment
      </button>
      </div>
       </div>
       <div v-if="orders===0" style="text-align: center;">
        <i class="bi bi-cart4" style="font-size:35px; color:orange"></i>

        <h4> you currently have no item in your cart</h4><br/>
          <h5>Browse our categories and discover our best deals!</h5>
        <button style="background-color:orange; color:white; border:none;border-radius:10px;width: 50%;height:30%;"><RouterLink class="dropdown-item" :to="{name:'home'}">
              Start Shopping!!!
            </RouterLink></button>
  
       </div>
       <div v-if="!token" style="text-align: center;">
        <i class="bi bi-cart4" style="font-size:35px;"></i>
       <h5> can't find your item in the cart
       <RouterLink class="dropdown-item" :to="{name:'Login'}">
              Sign In
       </RouterLink>
            don't have account?<RouterLink  class="dropdown-item" :to="{name:'SignUp'}">
              SignUp
            </RouterLink>
            </h5>
       </div>
      </div>
    </div>
</template>
<script>
import {useCartStore} from '@/stores/CartStore';
import axios from 'axios';
export default {
  components:{},
  data() {
    return {
      token: null,
       totalcost:0 ,
         orders:[],

       
    };
  },
  props: ["baseURL","cartCount"],
  methods: {

    formatPrice(value){
    return new Intl.NumberFormat('en-NG',{
      style:'currency',
      currency:'NGN',
      maximumFractionDigits:2
    }).format(value);
  },
    
    checkout(){
      this.$router.push({name:'BillingAddress'})
    },

    removeItem(productId){
      const cartStore=useCartStore();
      cartStore.removeFromCart(productId)
    }
  
  
  },



  computed:{
    totalPrice(){
      //calculate the Total price of all item in the cart
        const cartStore=useCartStore();
        return cartStore.totalPrice;
    },
    cart(){
      const cartStore=useCartStore();
      return cartStore.cart;
    }
  },

  mounted(){
    this.token=localStorage.getItem('token')
      this.cartCount

  
  }
}
</script>

<style scoped>
h4,h5{
  color:#484848;
  font-size:700;
}

</style>
