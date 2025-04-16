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

<h1 class="mb-4">USERS</h1>

<div v-if="loading" class="text-muted">loading Users...</div>

<table v-else class="table table-striped table-bordered">
    <thead class="table-dark">
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
                <button class="btn btn-sm btn-primary" @click="fetchOrders(user.id)">view orders</button>
            </td>
        </tr>
    </tbody>
</table>

 <!--Orders Section-->

 <div v-if="selectedOrders.lenth">
    <h2 class="mt-5">Orders for {{ selectedUser?.name }}</h2>
    <div class="row">
        <div v-for="order in selectedOrders" :key="order.id" class="col-md-6 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Order TotalPrice: ${{ order.totalPrice }} </h5>
                    <p class="card-text"><strong>Items:</strong></p>
                    <ul class="list-group list-group-flush">
                        <li v-for="item in order.orderItems" :key="item.id" class="list-group-item">
                            {{ item.name }} (x{{ item.quantity }})- ${{ item.price }}
                        </li>
                    </ul>
                </div>
                <div class="card-footer text-muted">
                    {{ new Date(order.dateOrdered).toLocaleString() }}
                </div>
            </div>
        </div>
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
            users:[],
            loading:true,
            selectedOrders:[],
            selectedUser:null,
        }
    },
    props: ["baseURL"],
    methods:{
//fetch all Users 
        async  fetchUsers(){
 await axios.get(`${this.baseURL}users`,{
  headers:{
    Authorization:`Bearer ${localStorage.getItem('token')}`
  }
 })
   .then(res => {
    const result=res.data;
    this.users=result;
    this.loading=false
    //this.$emit("fetchData")
   }).catch((err)=> console.log('err',err))
   this.loading=false
},
  //fetch all Orders
  async  fetchOrders(userId){
 await axios.get(`${this.baseURL}orders/get/userorders/${userId}`,{
  headers:{
    Authorization:`Bearer ${localStorage.getItem('token')}`
  }
 })
   .then(res => {
    const result=res.data;
    this.selectedOrders=result;
    console.log('endPoint:',this.selectedOrders)
    this.selectedUser=this.users.find(u=>u.id===userId);
   }).catch((err)=> console.log('err',err))
},
    },


    mounted(){
    this.fetchUsers()
}

}
</script>

<style>
</style>