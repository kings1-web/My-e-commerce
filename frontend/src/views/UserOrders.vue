<template>
    <div class="container mt-4">
    <h2 class="mb-4">Order history</h2>
  <div v-if="loading" class="text-muted">Loading...</div>
    <div v-if="orders.length === 0" class="alert alert-info">
      you have no order yet.
    </div>

    <div v-else>
      <div v-for="order in orders" :key="order.id" class="card mb">
        <div class="card-header"><strong>Order ID:</strong>{{ order.id }}
        </div>
        <div class="card-body">
          <p><strong>Date:</strong>{{ formatDate(order.dateOrdered) }}</p>
          <p>
            <strong>Status:</strong
            ><span class="badge bg-primary">{{ order.status }}</span>
          </p>
          <p>
            <strong>Status:</strong
            >{{formatPrice(order.totalPrice)}}
          </p>
          <ul class="list-group list-group-flush mt-3">
            <li
            class="list-group-item"
            v-for="item in order.orderItems"
            :key="item.id"
            >
           <h6> {{ item.product.name }} - quantity: {{ item.quantity }}</h6>
            </li>
            </ul>
        </div>
      </div>
    </div>
    <!--Order Detail Modal-->

  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";
export default {
  data() {
    return {
      orders: [],
      loading:true
    };
  },
  props: ["baseURL"],
  methods: {
    async fetchOrders() {
        const auth=useAuthStore();
      try {
        const response = await axios.get(`${this.baseURL}orders/get/userorders/${auth.userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        this.orders = response.data;
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-Ng',{
        year:'numeric',
        month:'short',
        day:'numeric',
      });
    },
    formatPrice(price) {
      return Number(price).toLocaleString();
    },
    
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>
