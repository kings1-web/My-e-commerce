<template>
    <div style="text-align: center; position: relative; left:26%; margin-top: 60px;">
        <form class="row g-3 col-6 text-start">
<h3>Billing Address</h3>
{{ users }}
{{ userorder }}
<div class="col-12">
  <label for="inputAddress" class="form-label">Address</label>
  <input type="text" class="form-control" 
  id="inputAddress" placeholder="1234 Main St" v-model="shippingAddress1">
</div>
<div class="col-12">
  <label for="inputAddress2" class="form-label">Address 2</label>
  <input type="text" class="form-control" 
  id="inputAddress2" placeholder="Apartment, studio, or floor" v-model="shippingAddress2">
</div>
<div class="col-md-6">
  <label for="inputCity" class="form-label">City</label>
  <input type="text" class="form-control" id="inputCity" v-model="city">
</div>
<div class="col-md-4">
  <label for="inputState" class="form-label">State</label>
  <select id="inputState" class="form-select" v-model="country">
    <option selected>Choose...</option>
    <option>...</option>
  </select>
</div>
<div class="col-md-2">
  <label for="inputZip" class="form-label">Zip</label>
  <input type="text" class="form-control" id="inputZip" v-model="zip">
</div>
<div class="col-12">
  <div class="form-check">
      <label class="form-label" for="phone" >
      phone no:
    </label>
    <input class="form-control" type="text" id="phone" v-model="phone">
  </div>
  </div>
  <div class="col-1">
  <div class="form-check">
      <label class="form-label" for="phone" >
      user:
    </label>
    <input class="form-control" type="checkbox" id="">
  </div>
</div>
<div class="col-12">
  <button type="button" class="btn btn-primary" @click="orderItems">Sign in</button>
</div>
</form>
    </div>


</template>

<script>
import axios from 'axios';
export default{
     data(){
        return {
          id:null,
            user:null,
            users:null,
            orderItems:null,
            userorder:null,
            token:null,
            shippingAddress1:null,
            shippingAddress2:null,
            city:null,
            zip:null,
            country:null,
            phone:null,
            status:'pending',
            totalPrice:null
      
        }
     },
  props: ["baseURL"],
    methods:{ 
  async  usersData(){
  await  axios.get(`${this.baseURL}users/:id/?token=${this.token}`)
   .then(res => {
    const result=res.data
    this.users=result;
   }).catch((err)=> console.log('err',err))
   },

   listCartItem(){
  axios.get(`${this.baseURL}orders/?token=${this.token}`)
   .then(res => {
    const result=res.data;
    this.userorder=result
   }).catch((err)=> console.log('err',err))
},


async   orderItem(){
    const order={
        orderItems:this.orderItems.id,
        user:this.user.id,
        shippingAddress1:this.shippingAddress1,
        shippingAddress2:this.shippingAddress2,
        city:this.city,
        zip:this.zip,
        country:this.country,
        phone:this.phone,

    }
    axios.post(`${this.baseURL}orders?token=${this.token}`,{
      orderItems:[{orderItems}],order
     }).then((res)=>{
      if(res.status==200){
        this.$swal({
        text:"product added successfully (proceed to cart to complete order)",
        icon:"success"
      });
     this.$emit("fetchData")
      }
     }).catch((err)=> console.log('err',err))
   }
},

    mounted(){
      this.id=this.$route.params.id,
      this.user=this.users.find((user)=> user.id==this.id)
      this.orderItems=this.userorder.find(order=> order.id==this.id)
        this.token=localStorage.getItem('token');
        this.usersData();
        this.listCartItem();
    }
}
</script>