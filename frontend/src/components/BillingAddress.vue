<template>
    <div style="text-align: center; position: relative; left:26%; margin-top: 60px;">
        <form  class="row g-3 col-6 text-start">
<h3>Billing Address</h3>
<div class="col-12">
  <label for="inputAddress" class="form-label">Address</label>
  <input type="text" class="form-control" 
  id="inputAddress" placeholder="1234 Main St" v-model="address.shippingAddress1" required>
</div>
<div class="col-12">
  <label for="inputAddress2" class="form-label">Address 2</label>
  <input type="text" class="form-control" 
  id="inputAddress2" placeholder="Apartment, studio, or floor" v-model="address.shippingAddress2" required>
</div>
<div class="col-md-6">
  <label for="inputCity" class="form-label">City</label>
  <input type="text" class="form-control" id="inputCity" v-model="address.city" required>
</div>
<div class="col-md-4">
  <label for="inputState" class="form-label">State</label>
  <select id="inputState" class="form-select" v-model="address.country" required>
    <option selected>Choose...</option>
    <option>ondo</option>
    <option>lagos</option>
    <option>ibadan</option>
  </select>
</div>
<div class="col-md-2">
  <label for="inputZip" class="form-label">Zip</label>
  <input type="text" class="form-control" id="inputZip" v-model="address.zip" required>
</div>
<div class="col-12">
  <div class="form-check">
      <label class="form-label" for="phone" >
      phone no:
    </label>
    <input class="form-control" type="text" id="phone" v-model="address.phone" required>
  </div>
  </div>
 
<div class="col-12">
  <button type="button" class="btn btn-primary" @click="goToCheckOut">Place Order</button>
</div>
</form>
    </div>


</template>

<script>
import { useCartStore } from '@/stores/CartStore';
import axios from 'axios';
export default{
     data(){
      return {
        stripeApiToken:"pk_test_51QezySJRvycA08QovbT1WKFZdnHc6ucWV1F8o47i2oxCvDlBty2VUYTazwM0S1hChabm5MYE5I2yJLpWKpjkuxkO00JFwgCneJ",
            stripe:null,
            token:localStorage.getItem('token'),


           address:{
            shippingAddress1: "",
            shippingAddress2: "",
            city:"",
            zip:"",
            country:"",
            phone: "",
            user:localStorage.getItem('userId') || null,
          }
      }
     },
  props: ["baseURL"],
    methods:{ 
     saveBilling(){
      const cartStore=useCartStore();
      cartStore.cart
      },
      
     


checkout(){
      this.$router.push({name:'CheckOut'})
    },

    goToCheckOut() {

      const cartStore=useCartStore();
      cartStore.cart
    // Pass product details to the backend
    axios.post(`${this.baseURL}orders/create-checkout-session/?token=${this.token}`, {
         items:cartStore.cart.map(item => ({
            name: item.name,
            images:item.image,
            quantity: item.quantity,
            unit_price: item.price
        })),
        address:this.address,
    }).then((response) => {
        localStorage.setItem('sessionId', response.data.sessionId);
        console.log('sessionId', response.data);
        this.stripe.redirectToCheckout({
            sessionId: response.data.sessionId,
        });
    }).catch((err) => console.log(err));
         
        },

   
},

    mounted(){
        this.token=localStorage.getItem('token');
        this.stripe=window.Stripe(this.stripeApiToken)

        
    }
}
</script>