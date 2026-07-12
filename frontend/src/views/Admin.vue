<template>
  <div class="admin-dashboard-wrapper bg-light min-vh-100 py-4">
    <div class="container-fluid px-md-5">
      
      <!-- TOP ACTION BAR & NAVIGATION HEADER BANNER -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-4 border-bottom gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1">Administrative Management Hub</h3>
          <p class="text-muted mb-0 small">Vet onboarding technicians, coordinate inventory catalogs, and process operational Paystack payouts.</p>
        </div>
        <div class="d-flex gap-2">
          <RouterLink :to="{ name: 'AdminProduct' }" class="btn btn-white border bg-white shadow-xs px-3 fw-semibold text-dark">
            📦 Product Catalog
          </RouterLink>
          <RouterLink :to="{ name: 'Category' }" class="btn btn-white border bg-white shadow-xs px-3 fw-semibold text-dark">
            🗂️ Manage Categories
          </RouterLink>
        </div>
      </div>

      <!-- MAIN SPLIT WORKSPACE GRID SYSTEM -->
      <div class="row g-4">
        
        <!-- ========================================================================= -->
        <!-- 🧭 LEFT GRID SIDEBAR COLUMN: VETTING TASKS AND CLIENTS RECORDS LIST -->
        <!-- ========================================================================= -->
        <div class="col-xl-4 d-flex flex-column gap-4">
          
          <!-- PANEL A: TECHNICIAN ONBOARDING APPROVAL LIST -->
          <div class="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div class="card-header bg-dark text-white py-3 border-0">
              <h6 class="mb-0 fw-bold d-flex align-items-center gap-2">🔧 Technician Verification Queue</h6>
            </div>
            
            <div class="list-group list-group-flush max-sidebar-height overflow-auto">
              <div v-if="installers.length === 0" class="p-4 text-center text-muted small bg-light-subtle italic">
                No active installer registration applications pending.
              </div>
              
              <div 
                v-for="installer in installers" 
                :key="'installer-' + (installer._id || installer.id)" 
                class="list-group-item p-3 d-flex justify-content-between align-items-center bg-white transition-hover"
              >
                <div class="text-truncate pe-2">
                  <h6 class="mb-0 fw-bold text-dark text-truncate small" style="font-size:0.85rem;">{{ installer.name }}</h6>
                  <small class="text-muted d-block text-truncate font-monospace" style="font-size:0.75rem;">{{ installer.email }}</small>
                  <span v-if="installer.isApproved" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5 mt-1 font-monospace" style="font-size:0.65rem;">Approved</span>
                  <span v-else class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-0.5 mt-1 font-monospace" style="font-size:0.65rem;">Pending Approval</span>
                </div>
                
                <div class="d-flex gap-1 flex-shrink-0">
                  <button v-if="!installer.isApproved" class="btn btn-success btn-xs fw-bold px-2 py-1" @click="approveInstaller(installer._id || installer.id)">Approve</button>
                  <button class="btn btn-outline-danger btn-xs px-2 py-1" @click="deleteInstaller(installer._id || installer.id)">Reject</button>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL B: ALL CUSTOMERS DIRECTORY SIDEBAR -->
          <div class="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div class="card-header bg-dark text-white py-3 border-0">
              <h6 class="mb-0 fw-bold d-flex align-items-center gap-2">👤 Platform Client Directory</h6>
            </div>
            
            <div class="list-group list-group-flush max-sidebar-height overflow-auto">
              <div v-if="loading" class="p-4 text-center text-muted small">
                <span class="spinner-border spinner-border-sm text-primary me-2"></span>Syncing user list records...
              </div>
              <div v-else-if="users.length === 0" class="p-4 text-center text-muted small bg-light-subtle italic">
                No customer user accounts registered.
              </div>
              
              <div 
                v-for="user in users" 
                :key="'user-' + user._id" 
                class="list-group-item p-3 d-flex justify-content-between align-items-center bg-white transition-hover"
                :class="{ 'bg-primary-subtle border-start border-primary border-3 shadow-xs': selectedUser?._id === user._id }"
              >
                <div class="text-truncate pe-2">
                  <h6 class="mb-0 fw-bold text-dark text-truncate small" style="font-size:0.85rem;">{{ user.name }}</h6>
                  <small class="text-muted font-monospace d-block text-truncate" style="font-size:0.75rem;">{{ user.email }}</small>
                </div>
                <button class="btn btn-primary btn-xs fw-semibold px-3 py-1 flex-shrink-0 rounded-pill shadow-xs" @click="fetchOrders(user)">
                  Orders &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- STANDALONE CHILD SERVICE DISPUTES COMPONENT WORKSPACE CONTAINER -->
          <InstallerDisputesPanel :baseURL="baseURL" />

        </div>
        <!-- ========================================================================= -->
        <!-- 📦 RIGHT MAIN VIEW PANEL COLUMN: DRILLDOWN OPERATIONS FOR CHOSEN CUSTOMER -->
        <!-- ========================================================================= -->
        <div class="col-xl-8">
          <div class="card border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            
            <div class="card-header bg-secondary text-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-bold d-flex align-items-center gap-2">📦 Product Invoices Operations Hub</h6>
              <span v-if="selectedUser" class="badge bg-white text-secondary font-monospace fw-bold px-2.5 py-1 rounded-pill shadow-xs small">{{ selectedUser.name }}</span>
            </div>

            <div class="card-body p-4 max-main-height overflow-auto">
              <!-- Case Fallback Boundary Element Condition: Prompt user to choose a target client parameter profile -->
              <div v-if="!selectedOrders.length" class="text-center py-5 my-5 text-muted">
                <span class="fs-1 d-block mb-3">📋</span>
                <h6 class="fw-bold text-dark">No Client Marketplace File Open</h6>
                <p class="small text-muted max-w-350 mx-auto mt-1">Select the blue "Orders &rarr;" button next to an individual client card in the directory list to load their data logs.</p>
              </div>

              <!-- Case Conditional Execution: Renders chosen data arrays smoothly -->
              <div v-else class="d-flex flex-column gap-4 animate-fade-in">
                <h5 class="fw-bold text-dark small font-monospace text-uppercase tracking-wider">Purchase Logs Folder for: <span class="text-primary text-lowercase">{{ selectedUser?.email }}</span></h5>
                
                <!-- RESTORED MARKETPLACE DATA PROCESSING GRID TABLE -->
                <div class="table-responsive border rounded-3 shadow-xs">
                  <table class="table table-hover align-middle mb-0 text-secondary">
                    <thead class="table-dark text-uppercase font-monospace small" style="font-size: 0.72rem;">
                      <tr>
                        <th class="ps-3">Shipping Target</th>
                        <th>Phone</th>
                        <th>Progress Status</th>
                        <th>Conf</th>
                        <th>Assigned Tech</th>
                        <th>Service Fee</th>
                        <th>Paystack Escrow</th>
                        <th class="pe-3 text-end">Action Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="order in selectedOrders" :key="'table-' + order._id" class="bg-white">
                        <td class="ps-3 fw-medium text-dark text-truncate small" style="max-width: 140px;" :title="order.shippingAddress1">
                          {{ order.shippingAddress1 }}
                        </td>
                        <td class="small font-monospace text-nowrap">{{ order.phone }}</td>
                        
                        <!-- 3. LIFECYCLE MANAGEMENT DROP DOWN DROPDOWN -->
                        <td>
                          <select v-model="order.status" class="form-select form-select-xs fw-semibold font-monospace" @change="updateStatus(order)">
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option v-if="order.status === 'Confirmed'">Confirmed</option>
                          </select>
                        </td>

                        <!-- 4. ORDER VERIFICATION SYNC MARKER -->
                        <td class="text-nowrap">
                          <span v-if="order.isConfirmed" class="text-success small fw-bold font-monospace">✔ OK</span>
                          <span v-else class="text-warning small font-monospace">Hold</span>
                        </td>

                        <!-- 5. ASSIGNED TECH FIELD REFERENCE OBJECTS -->
                        <td class="text-truncate small" style="max-width: 110px;" :title="order.assignedInstaller?.name">
                          <strong v-if="order.assignedInstaller" class="text-dark">{{ order.assignedInstaller.name }}</strong>
                          <span v-else class="text-muted small text-italic">Hardware-Only</span>
                        </td>

                        <!-- 6. SERVICE VALUATION PARSING METRICS -->
                        <td class="small font-monospace text-nowrap fw-semibold text-dark">
                          {{ order.installationFee > 0 ? '₦' + order.installationFee.toLocaleString() : '-' }}
                        </td>

                        <!-- 7. PAYSTACK LEDGER AUDITING BADGES -->
                        <td>
                          <span v-if="order.installerPayoutStatus === 'paid'" class="badge bg-success-subtle text-success border font-monospace text-uppercase" style="font-size: 0.65rem;">Settled</span>
                          <span v-else-if="order.installerPayoutStatus === 'pending'" class="badge bg-warning-subtle text-warning-emphasis border font-monospace text-uppercase" style="font-size: 0.65rem;">Escrowed</span>
                          <span v-else class="badge bg-light text-muted border font-monospace text-uppercase" style="font-size: 0.65rem;">N/A</span>
                        </td>

                        <!-- 8. OPERATIONAL PIPELINE ACTIONS ENGINE -->
                        <td class="pe-3 text-end text-nowrap">
                          <div class="d-flex justify-content-end gap-1">
                            <button class="btn btn-success btn-xs font-monospace fw-semibold" @click="confirmOrder(order)">Confirm</button>
                            <button v-if="order.installerPayoutStatus === 'pending' && order.status === 'Delivered'" class="btn btn-primary btn-xs font-monospace fw-bold shadow-xs px-2" @click="payoutInstallerFunds(order._id)">💸 Pay Tech</button>
                            <button class="btn btn-info btn-xs text-white" @click="openWhatsApp(order)"><i class="bi bi-whatsapp"></i></button>
                            <button class="btn btn-outline-danger btn-xs" @click="deleteOrder(order._id)"><i class="bi bi-trash-fill"></i></button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- CARDS VIEW GRID SUBSECTION: INVOICED COMPONENT LINE ITEMS BREAKDOWNS -->
                <div class="row g-3">
                  <div v-for="order in selectedOrders" :key="'card-' + order._id" class="col-md-6">
                    <div class="card border border-light-subtle h-100 shadow-xs bg-white rounded-3">
                      <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                          <h6 class="card-title fw-bold text-success mb-0" style="font-size:0.85rem;">Total Value: ₦{{ order.totalPrice?.toLocaleString() || 0 }}</h6>
                          <button class="btn btn-link p-0 text-decoration-none small text-danger fw-semibold" style="font-size:0.8rem;" @click="deleteOrder(order._id)">Delete Invoice</button>
                        </div>
                        
                        <p class="small font-monospace text-muted mb-2 text-uppercase fw-bold" style="font-size: 0.65rem;">Purchased Manifest Payload:</p>
                        <ul class="list-group list-group-flush">
                          <li v-for="item in order.orderItems" :key="item._id" class="list-group-item px-0 py-2 border-light-subtle last-no-border">
                            <div v-if="item.product" class="d-flex gap-2 align-items-center">
                              <img :src="item.product.image || '/placeholder.png'" alt="Hardware" class="rounded border object-fit-cover flex-shrink-0" width="45" height="45" />
                              <div class="text-truncate flex-grow-1" style="font-size:0.75rem;">
                                <span class="fw-bold text-dark d-block text-truncate mb-0" style="font-size:0.78rem;">{{ item.product.name }}</span>
                                <span class="text-muted d-block font-monospace">Qty: {{ item.quantity }} | Cat: {{ item.product?.category?.name || 'N/A' }}</span>
                                <span class="fw-semibold text-primary font-monospace">Unit: ₦{{ item.product.price?.toLocaleString() }}</span>
                              </div>
                            </div>
                            <div v-else class="text-muted small italic p-1">Product reference entity drop array payload missing matching catalog IDs</div>
                          </li>
                        </ul>
                      </div>
                      <div class="card-footer text-muted bg-light border-0 small font-monospace" style="font-size: 0.7rem;">
                        Timestamp Ordered: {{ order.dateOrdered ? new Date(order.dateOrdered).toLocaleString() : 'Unindexed' }}
                      </div>
                    </div>
                  </div>
                </div>

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
// Import it cleanly at the top of your dashboard script script file
import InstallerDisputesPanel from "@/components/InstallerDisputesPanel.vue";

export default {

   components: { InstallerDisputesPanel }, // Register it here

  props: ["baseURL"],

  data() {
    return {
      users: [],
      installers: [],
      selectedOrders: [],
      selectedUser: null,
      loading: true,
       // 🟢 CRITICAL FIXED PROPERTY: Added to prevent undefined runtime evaluation errors inside methods
      requests: [] 
    };
  },

  mounted() {
    this.fetchUsers();
    this.fetchInstallers();
    this.fetchRequests(); // ✅ IMPORTANT
  },

  computed: {
    disputedOrders() {
      return this.requests.filter((r) => r.dispute?.isOpen);
    },
  },

  methods: {

    async releasePayment(id) {
  const confirm = await this.$swal({
    title: "Release Payment?",
    text: "Installer will receive money",
    icon: "warning",
    showCancelButton: true
  });

  if (!confirm.isConfirmed) return;

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${this.baseURL}payments/release/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    this.$swal("Success", "Installer paid", "success");

    this.fetchRequests();

  } catch (err) {
    this.$swal(
      "Error",
      err.response?.data?.message || "Payment failed",
      "error"
    );
  }
},

    async assignInstaller(req) {
      const installerId = prompt("Enter installer ID");

      await axios.put(
        `${this.baseURL}requests/${req._id}/assign`,
        { installerId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      this.fetchRequests();
    },

    async markCompleted(id) {
      await axios.put(
        `${this.baseURL}requests/${id}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      this.fetchRequests();
    },

    async payInstaller(id) {
      await axios.post(
        `${this.baseURL}payments/orders/${id}/payout-installer`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      this.fetchRequests();
    },

    async fetchRequests() {
      try {
        const res = await axios.get(`${this.baseURL}requests`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.requests = res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async fetchDisputes() {
      try {
        const res = await axios.get(`${this.baseURL}requests/disputes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.disputes = res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async resolveDispute(id, action) {
      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${this.baseURL}requests/${id}/resolve`,
          { action }, // "release" or "refund"
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        this.$swal("Success", "Dispute resolved", "success");

        // ✅ refresh everything
        this.fetchRequests();
      } catch (err) {
        this.$swal(
          "Error",
          err.response?.data?.message || "Error resolving dispute",
          "error",
        );
      }
    },

    viewDispute(request) {
      this.$swal({
        title: "Dispute Reason",
        text: request.dispute?.reason || "No reason provided",
        icon: "info",
      });
    },

    async openDispute(request) {
      const { value: reason } = await this.$swal({
        title: "Open Dispute",
        input: "text",
        inputPlaceholder: "Enter reason...",
        inputValidator: (value) => {
          if (!value) return "Reason is required!";
        },
        showCancelButton: true,
      });

      if (!reason) return;

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${this.baseURL}requests/${request._id}/dispute`,
          { reason },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        this.$swal("Success", "Dispute opened!", "success");

        // ✅ refresh UI
        this.fetchRequests();
      } catch (err) {
        this.$swal(
          "Error",
          err.response?.data?.message || "Failed to open dispute",
          "error",
        );
      }
    },

    async fetchInstallers() {
      console.log("fetchInstallers running...");
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${this.baseURL}installers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.installers = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error(
          "Admin authentication or fetch error:",
          err.response?.data || err.message,
        );
        this.installers = [];
      }
    },

    async approveInstaller(id) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Session expired. Please log back in as an administrator.");
          return;
        }

        await axios.put(
          `${this.baseURL}installers/${id}/approve`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        this.$swal({
          text: "Technician profile successfully promoted to active installer!",
          icon: "success",
        });

        await this.fetchInstallers();
      } catch (err) {
        console.error("Approval blocked:", err.response?.data || err.message);
        alert(
          "Approval Failed: " +
            (err.response?.data?.message || "Access Denied."),
        );
      }
    },

    async deleteInstaller(id) {
      this.$swal({
        title: "Are you sure?",
        text: "You are about to reject and permanently delete this installer profile.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, reject and delete",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("token");

            await axios.delete(`${this.baseURL}installers/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            this.installers = this.installers.filter(
              (i) => i._id !== id && i.id !== id,
            );

            this.$swal({
              title: "Deleted!",
              text: "The installer profile has been completely removed and notified.",
              icon: "success",
            });
          } catch (err) {
            console.error("Error executing installer profile deletion:", err);
            this.$swal({
              title: "Operation Failed",
              text:
                err.response?.data?.message ||
                "Could not process profile removal.",
              icon: "error",
            });
          }
        }
      });
    },

    async fetchUsers() {
      try {
        const res = await axios.get(`${this.baseURL}users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.users = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders(user) {
      this.selectedUser = user;

      try {
        const res = await axios.get(
          `${this.baseURL}orders/get/userorders/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        this.selectedOrders = res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async payoutInstallerFunds(orderId) {
      try {
        const token = localStorage.getItem("token");

        this.$swal({
          title: "Processing Payout",
          text: "Communicating with Paystack wallet transfer architecture...",
          allowOutsideClick: false,
          didOpen: () => {
            this.$swal.showLoading();
          },
        });

        const res = await axios.post(
          `${this.baseURL}payments/orders/${orderId}/payout-installer`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        this.$swal({
          title: "Transfer Complete! 💸",
          text: res.data.message || "Installer has been credited successfully.",
          icon: "success",
        });

        this.fetchDisputes();
      } catch (err) {
        console.error("Manual Transfer Routing Failed:", err);
        this.$swal({
          title: "Payout Fault",
          text:
            err.response?.data?.message ||
            "Failed to disburse funds. Verify your Paystack balance.",
          icon: "error",
        });
      }
    },

    async confirmOrder(order) {
      try {
        await axios.put(
          `${this.baseURL}orders/${order._id}`,
          {
            status: "Confirmed",
            isConfirmed: true,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        alert("Order confirmed");
        this.fetchOrders(this.selectedUser);
      } catch (err) {
        console.error(err);
      }
    },

    // 🟢 RE-INTEGRATED: WhatsApp Dialer handler method
    openWhatsApp(order) {
      const phone = order.phone;
      const message = encodeURIComponent(
        `Hello ${order.user?.name || "Customer"}, we are confirming your order.`,
      );
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    },

    // 🟢 RE-INTEGRATED: Document Deletion mapper method
    async deleteOrder(id) {
      if (!confirm("Delete order?")) return;

      try {
        await axios.delete(`${this.baseURL}orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.selectedOrders = this.selectedOrders.filter((o) => o._id !== id);
      } catch (err) {
        console.error(err);
      }
    },

    // 🟢 RE-INTEGRATED: Status Options dropdown tracker method
    async updateStatus(order) {
      try {
        await axios.put(
          `${this.baseURL}orders/${order._id}`,
          { status: order.status },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      } catch (err) {
        console.error(err);
      }
    },
  }, // End of methods block
}; // End of component options config
</script>
