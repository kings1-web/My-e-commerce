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
        <div v-for="order in orders" :key="order.id">
      <div v-for="item in order.orderItems"
      :key="item._id"
        class="row mt-2 pt-3 justify-content-around"
        >
       <div class="col-2"></div>
       <div class="col-md-3 embde-responsive embed-responsive-16by9  ">
        <img :src="item.product.image" alt="" class=" card-image-top
        w-100 embed-responsive embed-responsive-item"
        style="object-fit:cover;"/>
       </div>
       <!--display product name, quantity-->
       <div class="col-md-5 px-3">
        <div class="card-block px-3">
          <h6 class="card-title">
           <RouterLink :to="{name: 'ShowDetails',params:{id:item.product.id}}">
            {{ item.product.name }}
           
          </RouterLink>
          </h6>
          <p class="mb-0 fw-bold" id="iitem-price">
            $ {{ item.product.price }} per unit
          </p>
          <p class="m-0">
            Quantity:{{ item.quantity }}
          </p>
        </div>
           <p class="mb-0" style="float:right">
            Total: <span class="fw-bold">
              $ {{ item.product.price * item.quantity }}
            </span>
           </p>
           <a href="#" clsss="text-end" @click="deletItem(order.id)">Remove From Cart</a>
           <br/><br/>
           
<button class="btn btn-primary" style="overflow: auto;"><a href="{{ item.product.brand }}"
  class="text-center text-white">get the product</a></button>
      </div>
      <div class="col-12">
          <div class="col-12"><hr /></div>
        </div>
      <!-- display the price-->
       
      </div>
      </div>
      <div class="total-cost pt-2 text-end">
      <h5>Total:$ {{ getTotalCartPrice }}</h5>
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
import axios from 'axios';
export default {
  components:{},
  data() {
    return {
      cartItems:[],
      orders:[],
      token: null,
       totalcost:0 ,
       
    };
  },
  props: ["baseURL","cartCount"],
  methods: {
//fetch all item in the cart
async  listCartItem(){
 await axios.get(`${this.baseURL}orders`,{
  headers:{
    Authorization:`Bearer ${localStorage.getItem('token')}`
  }
 })
   .then(res => {
    const result=res.data;
    this.orders=result
   }).catch((err)=> console.log('err',err))
},

checkout(){
      this.$router.push({name:'CheckOut'})
    },

    
    

async deletItem(orderId){
    await  axios.delete(`${this.baseURL}orders/${orderId}/?token=${this.token}`)
    .then((res)=>{
        if(res.status==201){
          this.$routeer.go(0)
        }
        this.$emit("fetchData")
      }).catch((err)=> console.log("err",err));
      this.orders=this.orders.filter(order =>order.id !== orderId);
    },
  
  },



  computed:{
    getTotalCartPrice(){
      //calculate the Total price of all item in the cart
        return this.orders.reduce((total, order)=> total + (order.totalPrice||0),0);
    },
  },

  mounted(){
    this.token=localStorage.getItem('token')
    this.listCartItem();
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
