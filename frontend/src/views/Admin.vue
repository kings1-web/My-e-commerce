<template>
<div class="container py-4 text-center">
    <RouterLink :to="{name:'AdminProduct'}">
    <button class="btn btn-primary btn-lg">Admin product</button>
</RouterLink>
<br/><br/>
<RouterLink :to="{name:'Category'}">
    <button class="btn btn-primary btn-lg">Admin category</button>
</RouterLink>
<br/><br/>
<!--Users Detail-->
<div class="container my-4">

<h1 class="mb-4">ALL Orders</h1>

<div v-if="loading" class="text-muted">loading Users...</div>


 <!--Orders Section-->

 <div v-else-if="orders.lenth===0" class="alert alert-warning">
    no orders found.
 </div>
    
<div  v-else>
    <div v-for="order in orders" :key="order.id" class="card mb-4 shadow-sm">
        <div class="card-header bg-primary text-white d-flex justify-content-between">
            <span>Order by:{{order.user?.name}} ({{order.user?.email}})</span>
            <span>Total:{{order.totalPrice}}</span>
        </div>
        <div class="card-body">
            <h6>Purchase-Items:</h6>
            <ul class="list-group list-group-flush">
                <li v-for="item in order.orderItems" :key="item.id" class="list-group-item">
                    <div v-if="item.product">
    <h6>{{ item.product.name }}</h6>
    <img :src="item.product.image" alt="Product image" width="100" />
    <h6>Price: {{ item.product.price }} NGN</h6>
  </div>
  <div v-else>
    <p>Product info not available</p>
  </div>
  <h6>Quantity: {{ item.quantity }}</h6>
                    <span class="texr-muted">Category: {{item.product?.category?.name}}</span>
                </li>
            </ul>
        </div>
        <div class="card-footer text-muted">
            {{new Date(order.dateOrdered)}}
        </div>
        <button
        class="btn btn-sm btn-danger"
        @click="deleteOrder(order.id)"
        >
        Delete
      </button>
    </div>
</div>
</div>
</div>

</template>

<script>
import axios from "axios";
export default{
    data(){
        return {
            orders:[],
            loading:true,
        }
    },
    props: ["baseURL"],
//fetch all Users 
methods: {
  
  async fetchOrders() {
    try {
      const res = await axios.get(`${this.baseURL}orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      this.orders = res.data;
    } catch (err) {
      console.error('Error fetching orders:', err);
    }finally{
        this.loading=false;
    }
},
async deleteOrder(orderId){
  if(!confirm('are you sure you want to delete this order?'))return;

  try{
    const token=localStorage.getItem('token');
    await axios.delete(`${this.baseURL}orders/${orderId}`,{
      headers:{Authorization:token}
    });
    this.orders=this.orders.filter(order=>order.id !==orderId);
    this.$swal({
             text:"Product deleted successfully",
             icon:"success"
              });
  }catch(err){
    console.error('Error deleting order:', err)
    this.$swal({
             text:"Failed to delete order!",
             icon:"error"
              });
  }
}

  },

    mounted(){
   // this.fetchUsers()
    this.fetchOrders()
}

}
</script>

<style>
</style>