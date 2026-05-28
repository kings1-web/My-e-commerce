<template>

  <div class="container py-4 text-center">
    <RouterLink :to="{ name: 'AdminProduct' }">
      <button class="btn btn-primary btn-lg">Admin product</button>
    </RouterLink>
    <br /><br />
    <RouterLink :to="{ name: 'Category' }">
      <button class="btn btn-primary btn-lg">Admin category</button>
    </RouterLink>
    <br /><br />
    <!--Users Detail-->
    <div class="container my-4">
      <h1 class="mb-4">ALL Orders</h1>
      <div v-if="loading" class="text-muted">loading Users...</div>

     
    
<!---User Orders-->
<table v-else class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Order</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
  
            <td>
              <button
                type="button"
                class="btn btn-primary"
                @click="fetchOrders(user.id)"
              >
                View Order
              </button>
            </td>
          </tr>
        </tbody>
      </table>

<div v-if="selectedOrders.length">
  <h2 class="mt-5">Orders for: {{ selectedUser.email }} </h2>
  <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr >
            <th>Home Address</th>
            <th>Phone No</th>
            <th>City</th>
            <th>State</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ord in selectedOrders" :key="ord.id">
            <td>{{ord.shippingAddress1 }}</td>
            <td>{{ord.phone}}</td>
             <td>{{ ord.city }}</td>
            <td>
            {{ ord.country }}
            </td>
             <td>
  <select v-model="ord.status" @change="updateStatus(ord)" class="form-select">
    <option value="Paid">Paid</option>
    <option value="Processing">Processing</option>
    <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancelled">Cancelled</option>
  </select>
</td>

         <td> {{ new Date(ord.dateOrdered).toLocaleString() }}</td>
             
          </tr>
        </tbody>
      </table>
  <div class="row">
    <div v-for="order in selectedOrders" :key="order.id" class="col-md-6 mb-4">

      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Order Total:${{ order.totalPrice }}</h5>
          <p class="card-text"><strong>Items:</strong></p>
           <ul class="list-group list-group-flush">
              <li
                v-for="item in order.orderItems"
                :key="item.id"
                class="list-group-item"
              >
                <div v-if="item.product">
                  <h6>{{ item.product.name }}</h6>
                  <img
                    :src="item.product.image"
                    alt="Product image"
                    width="100"
                  />
                  <h6>Price: {{ item.product.price }} NGN</h6>
                </div>
                <div v-else>
                  <p>Product info not available</p>
                </div>
                <h6>Quantity: {{ item.quantity }}</h6>
                <span class="text-muted"
                  >Category: {{ item.product?.category?.name }}</span
                >
              </li>
            </ul>
        </div>
        <div class="card-footer text-muted">
          {{ new Date(order.dateOrdered).toLocaleString() }}
        </div>
        <button class="btn btn-sm btn-danger" @click="deleteOrder(order.id)">
            Delete
          </button>
      </div>
    </div>
  </div>
</div>


      <!--Orders Section-->

      <!-- <div v-else-if="orders.lenth===0" class="alert alert-warning">
    no orders found.
 </div>-->

    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      users: [],
      loading: true,
      selectedOrders:[] ,
      selectedUser:null
    };
  },
  props: ["baseURL"],
  //fetch all Users
  methods: {
   

    //userOrder

    async fetchOrders(userId) {
  try {
    const res = await axios.get(`${this.baseURL}orders/get/userorders/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    this.selectedOrders = res.data;
    this.selectedUser = this.users.find((u) => u.id === userId);
  } catch (err) {
    console.error("Error fetching orders:", err);
console.log("Catch triggered");
    // Show a message or clear selectedOrders
    this.selectedOrders = [];
    this.selectedUser = null;
    this.$swal({
      icon: "warning",
      text: "No orders found for this user.",
    });
  } finally {
    this.loading = false;
  }
},

 async updateStatus(order) {
    try {
      const response = await fetch(`${this.baseURL}orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: order.status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();
      console.log('Status updated:', data);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  },

    async fetchUsers() {
      try {
        const res = await axios.get(`${this.baseURL}users`, {
          headers: {
             Authorization:`Bearer ${localStorage.getItem("token")}`
             },
        });
        this.users = res.data;
        this.loading = false;
      } catch (err) {
        console.error("Error fetching users:", err);
        this.loading=false;
      }
    },

    async deleteOrder(orderId) {
      if (!confirm("are you sure you want to delete this order?")) return;

      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${this.baseURL}orders/${orderId}`, {
          headers: { Authorization: token },
        });
        this.selectedOrders = this.selectedOrders.filter((order) => order.id !== orderId);
        this.$swal({
          text: "Product deleted successfully",
          icon: "success",
        });
      } catch (err) {
        console.error("Error deleting order:", err);
        this.$swal({
          text: "Failed to delete order!",
          icon: "error",
        });
      }
    },
  },

   mounted() {
   this.fetchUsers(); // Make sure users are loaded first

  /*if (this.users.length > 0) {
    const firstUserId = this.users[0].id;
    this.fetchOrders(userId);
  }*/
}

};
</script>

<style></style>
