<template>
    <div style="text-align: center; position: relative; left:26%; margin-top: 60px;">
        <form @submit.prevent="saveBilling"  class="row g-3 col-6 text-start">
<h3>Billing Address</h3>
<div class="col-12">
  <label for="inputAddress" class="form-label">Address</label>
  <input type="text" class="form-control" 
  id="inputAddress" placeholder="1234 Main St" v-model="billingAddress.shippingAddress1" required>
</div>
<div class="col-12">
  <label for="inputAddress2" class="form-label">Address 2</label>
  <input type="text" class="form-control" 
  id="inputAddress2" placeholder="Apartment, studio, or floor" v-model="billingAddress.shippingAddress2" required>
</div>
<div class="col-md-6">
  <label for="inputCity" class="form-label">City</label>
  <input type="text" class="form-control" id="inputCity" v-model="billingAddress.city" required>
</div>
<div class="col-md-4">
  <label for="inputState" class="form-label">State</label>
  <select id="inputState" class="form-select" v-model="billingAddress.country" required>
    <option selected>Choose...</option>
    <option>ondo</option>
    <option>lagos</option>
    <option>ibadan</option>
  </select>
</div>
<div class="col-md-2">
  <label for="inputZip" class="form-label">Zip</label>
  <input type="text" class="form-control" id="inputZip" v-model="billingAddress.zip" required>
</div>
<div class="col-12">
  <div class="form-check">
      <label class="form-label" for="phone" >
      phone no:
    </label>
    <input class="form-control" type="text" id="phone" v-model="billingAddress.phone" required>
  </div>
  </div>
 
<div class="col-12">
  <button type="submit" class="btn btn-primary">Place Order</button>
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
           billingAddress:{
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
        cartStore.updateBillingAddress(this.billingAddress)
      this.$router.push({name:'CheckOut'})
      },
  



checkout(){
      this.$router.push({name:'CheckOut'})
    },
   
},

    mounted(){
     // this.id=this.$route.paramthis.usersData();
        this.token=localStorage.getItem('token');
        
    }
}
</script>