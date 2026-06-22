<template>
  <div class="container py-4">
    <!-- Top Admin Navigation Links -->
    <div class="d-flex gap-3 justify-content-center mb-5">
      <RouterLink :to="{ name: 'AdminProduct' }" class="btn btn-primary btn-lg">
        Admin Product
      </RouterLink>
      <RouterLink :to="{ name: 'Category' }" class="btn btn-primary btn-lg">
        Admin Category
      </RouterLink>
    </div>

    <!-- Users & Orders Management Segment -->
    <div class="card shadow-sm mb-5">
      <div class="card-header bg-dark text-white">
        <h5 class="mb-0">All Customer Orders</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-3 text-muted">
          <span class="spinner-border spinner-border-sm me-2"></span>Loading user data...
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped table-hover align-middle border">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td class="text-center">
                  <button type="button" class="btn btn-sm btn-outline-primary" @click="fetchOrders(user.id)">
                    View Orders
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Selected User Orders Section -->
    <div v-if="selectedOrders.length" class="mb-5">
      <div class="alert alert-info py-2 mb-3">
        <h6 class="mb-0 fw-bold">Displaying Orders for: {{ selectedUser?.email }}</h6>
      </div>

      <div class="table-responsive mb-4">
        <table class="table table-bordered align-middle">
          <thead class="table-dark">
            <tr>
              <th>Home Address</th>
              <th>Phone No</th>
              <th>City</th>
              <th>Country / State</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in selectedOrders" :key="ord.id">
              <td>{{ ord.shippingAddress1 }}</td>
              <td>{{ ord.phone }}</td>
              <td>{{ ord.city }}</td>
              <td>{{ ord.country }}</td>
              <td>
                <select v-model="ord.status" @change="updateStatus(ord)" class="form-select form-select-sm">
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td class="small">{{ new Date(ord.dateOrdered).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Order Items Detail Cards Grid -->
      <div class="row">
        <div v-for="order in selectedOrders" :key="order.id" class="col-md-6 mb-4">
          <div class="card h-100 shadow-xs border-light-subtle">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title fw-bold mb-0 text-success">Total: ${{ order.totalPrice }}</h6>
                <button class="btn btn-sm btn-outline-danger" @click="deleteOrder(order.id)">
                  Delete Order
                </button>
              </div>
              <p class="small fw-semibold border-bottom pb-1 mb-2 text-muted">Purchased Items:</p>
              <ul class="list-group list-group-flush small">
                <li v-for="item in order.orderItems" :key="item.id" class="list-group-item px-0 py-2">
                  <div v-if="item.product" class="d-flex gap-3 align-items-center">
                    <img :src="item.product.image" alt="Product" class="img-thumbnail" width="70" />
                    <div>
                      <h6 class="mb-0 fw-bold small text-dark">{{ item.product.name }}</h6>
                      <span class="text-muted d-block" style="font-size:0.75rem;">Qty: {{ item.quantity }} | Category: {{ item.product?.category?.name || 'N/A' }}</span>
                      <span class="fw-semibold text-primary" style="font-size:0.8rem;">Price: {{ item.product.price }} NGN</span>
                    </div>
                  </div>
                  <div v-else class="text-muted italic">Product info not available</div>
                </li>
              </ul>
            </div>
            <div class="card-footer text-muted bg-light small">
              Ordered: {{ new Date(order.dateOrdered).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Installer Approvals Section Grid Component -->
    <div class="card shadow-sm mt-4">
      <div class="card-header bg-dark text-white">
        <h5 class="mb-0">Technician Approval Applications</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="installers.length === 0">
                <td colspan="5" class="text-center text-muted py-4">No installer registration accounts pending records.</td>
              </tr>
              <tr v-for="installer in installers" :key="installer._id">
                <td>{{ installer.name }}</td>
                <td>{{ installer.email }}</td>
                <td>{{ installer.location }}</td>
                <td class="text-center">
                  <span v-if="installer.isApproved" class="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">Approved</span>
                  <span v-else class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1">Pending</span>
                </td>
                <td class="text-center">
                  <!-- ✅ FIXED HTML: Placed both buttons inside a clean unified bootstrap flex container -->
                  <div class="d-flex justify-content-center gap-2">
                    <button v-if="!installer.isApproved" class="btn btn-success btn-sm px-3" @click="approveInstaller(installer._id)">
                      Approve
                    </button>
                    <button v-if="!installer.isApproved" class="btn btn-danger btn-sm px-3" @click="deleteInstaller(installer._id)">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminDashboardPanel",
  props: {
    baseURL: { type: String, required: true }
  },
  data() {
    return {
      users: [],
      installers: [],
      loading: true,
      selectedOrders: [],
      selectedUser: null
    };
  },
  mounted() {
    // ✅ Safely runs both initial collection fetches sequentially when admin view mounts
    this.fetchUsers(); 
    this.fetchInstallers(); 
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await axios.get(`${this.baseURL}users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.users = res.data;
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        this.loading = false;
      }
    },
  
   async fetchInstallers() {
    console.log("fetchInstallers")
  try {
   const token = localStorage.getItem("token"); // 🔐 Must be the Admin's login token
    
    const res = await axios.get(`${this.baseURL}installers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.installers = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Admin authentication or fetch error:", err.response?.data || err.message);
    this.installers = []; 
  }
},



    async approveInstaller(installerID) {
      try {
        await axios.put(
          `${this.baseURL}installers/${installerID}/approve`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        this.installers = this.installers.map((i) =>
          i._id === installerID ? { ...i, isApproved: true } : i
        );

        this.$swal({
          text: "Installer approved!",
          icon: "success"
        });
      } catch (err) {
        console.error(err);
        alert("Failed to process profile authorization update.");
      }
    },

    async deleteInstaller(id) {
  // 1. Trigger the SweetAlert confirmation popup layout configuration
  this.$swal({
    title: "Are you sure?",
    text: "You are about to reject and permanently delete this installer profile.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545", // Bootstrap Danger Red color hex code
    cancelButtonColor: "#6c757d",  // Bootstrap Secondary Grey color hex code
    confirmButtonText: "Yes, reject and delete",
    cancelButtonText: "Cancel"
  }).then(async (result) => {
    // 2. This inner block only executes if the admin clicks the red confirm button
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        
        // Issue the secure DELETE API operation request parameters straight to your backend
        await axios.delete(`${this.baseURL}installers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Sync and filter the local UI installers array instantly without needing a full page reload
        this.installers = this.installers.filter((i) => i._id !== id);

        // Display a final success confirmation modal notice window banner
        this.$swal({
          title: "Deleted!",
          text: "The installer profile has been completely removed and notified.",
          icon: "success"
        });

      } catch (err) {
        console.error("Error executing installer profile deletion:", err);
        this.$swal({
          title: "Operation Failed",
          text: err.response?.data?.message || "Could not process profile removal.",
          icon: "error"
        });
      }
    }
  });
},


    async fetchOrders(userId) {
      this.loading = true;
      try {
        const res = await axios.get(
          `${this.baseURL}orders/get/userorders/${userId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.selectedOrders = res.data;
        this.selectedUser = this.users.find((u) => u.id === userId);
      } catch (err) {
        console.error("Error fetching orders:", err);
        this.selectedOrders = [];
        this.selectedUser = null;
        this.$swal({ icon: "warning", text: "No orders found for this user." });
      } finally {
        this.loading = false;
      }
    },
    async updateStatus(order) {
      try {
        await axios.put(
          `${this.baseURL}orders/${order.id}`,
          { status: order.status },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.$swal({ text: "Order status updated successfully!", icon: "success" });
      } catch (err) {
        console.error("Error updating order status:", err);
        alert("Failed to save state transformation.");
      }
    },
    // ✅ ADDED & CORRRECTED: Your complete delete order function block with "Bearer " prefixing fixed!
    async deleteOrder(orderId) {
      if (!confirm("Are you sure you want to delete this order?")) return;

      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${this.baseURL}orders/${orderId}`, {
          // Fixed by explicitly template string-interpolating Bearer tag formatting rules
          headers: { Authorization: `Bearer ${token}` },
        });
        
        this.selectedOrders = this.selectedOrders.filter(
          (order) => order.id !== orderId
        );
        
        this.$swal({
          text: "Order deleted successfully",
          icon: "success",
        });
      } catch (err) {
        console.error("Error deleting order:", err);
        this.$swal({
          text: "Failed to delete order!",
          icon: "error",
        });
      }
    }
  } // Methods block closing bracket
}; // Export default closing bracket
</script>


<style></style>
