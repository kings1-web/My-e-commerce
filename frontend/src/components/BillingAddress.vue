<template>
  <div class="container py-4" style="background: black; color: white">
    <form class="row g-3 col-12 col-md-6 mx-auto text-start">
      <h3 class="text-center">Billing Address</h3>
      <!-- Address -->
      <div class="col-12">
        <label class="form-label">Address</label>
        <input type="text" class="form-control" v-model="address.shippingAddress1" required />
      </div>
      <div class="col-12">
        <label class="form-label">Address 2 (Optional)</label>
        <input type="text" class="form-control" v-model="address.shippingAddress2" />
      </div>
      <!-- City -->
      <div class="col-md-6">
        <label class="form-label">City</label>
        <input type="text" class="form-control" v-model="address.city" required />
      </div>
      <!-- Zip -->
      <div class="col-md-6">
        <label class="form-label">zip</label>
        <input type="text" class="form-control" v-model="address.zip" required />
      </div>
      <!-- Country -->
      <div class="col-md-6">
        <label class="form-label">Country</label>
        <input type="text" class="form-control" v-model="address.country" required />
      </div>
      <!-- State -->
      <div class="col-md-6">
        <label class="form-label">State</label>
        <select class="form-select" v-model="address.state" required>
          <option disabled value="">Choose...</option>
          <option>Lagos</option>
          <option>Abuja</option>
          <option>Ibadan</option>
          <option>Ondo</option>
        </select>
      </div>
      <!-- Phone -->
      <div class="col-12">
        <label class="form-label">Phone</label>
        <input class="form-control" v-model="address.phone" required />
      </div>
      <!-- Buttons -->
      <div class="col-12">
        <button type="button" class="btn btn-success w-100 mb-2" @click="goToCheckOut('paystack')" :disabled="isProcessing">
          <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> Pay Now
        </button>
        <button type="button" class="btn btn-secondary w-100" @click="goToCheckOut('cod')" :disabled="isProcessing">
          Pay on Delivery
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { useCartStore } from "@/stores/CartStore";
import { useAuthStore } from "@/stores/auth";

export default {
  props: ["baseURL"],
  data() {
    return {
      isProcessing: false,
      address: {
        shippingAddress1: "",
        shippingAddress2: "",
        city: "",
        state: "",
        phone: "",
        zip: "",
        country: "",
      },
    };
  },
  computed: {
    cart() {
      return useCartStore().cart;
    },
    auth() {
      return useAuthStore();
    },
  },
  methods: {
    // 🔍 GET GA4 CLIENT ID
    getGAClientId() {
      try {
        // Fetches your tracking session ID asynchronously from the injected instance
        return this.$gtag.query('get', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-T6QMRGJSWS', 'client_id');
      } catch (e) {
        console.error("GA4 client ID acquisition failed:", e);
        return null;
      }
    },
    // 🔍 VALIDATION
    validateForm() {
      if (
        !this.address.shippingAddress1 ||
        !this.address.city ||
        !this.address.state ||
        !this.address.phone
      ) {
        this.$swal({
          text: "Please fill all required fields",
          icon: "warning",
        });
        return false;
      }
      if (this.address.phone.length < 10) {
        this.$swal({
          text: "Invalid phone number",
          icon: "warning",
        });
        return false;
      }
      return true;
    },
    async placeCODOrder() {
      const result = await this.$swal({
        title: "Confirm Order",
        text: "Are you sure you want to place this order with Cash on Delivery?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, I’m serious",
      });
      if (!result.isConfirmed) return;

      try {
        const gaClientId = this.getGAClientId(); // 👈 Grab GA ID

        const res = await fetch(`${this.baseURL}orders/cod`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderItems: this.cart,
            ...this.address,
            confirmationMessage: "Customer confirmed COD order",
            gaClientId: gaClientId, // 👈 Send GA ID to COD route
          }),
        });
        const data = await res.json();
        if (data.success) {
          // ✅ WhatsApp message
          const phone = "2348148674341"; // YOUR NUMBER
          const message = encodeURIComponent(
            `Hello, I just placed a COD order.\nName: ${this.auth.user.name}\nPhone: ${this.address.phone}\nAddress: ${this.address.shippingAddress1}, ${this.address.city}`
          );
          window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
          this.$swal({
            text: "Order placed! Please confirm on WhatsApp.",
            icon: "success",
          });
          useCartStore().clearCart();
          this.$router.push({ name: "home" });
        }
      } catch (err) {
        console.error(err);
      }
    },
    async goToCheckOut(method) {
      if (!this.cart.length) {
        return this.$swal({ text: "Cart is empty!", icon: "error" });
      }
      if (!this.validateForm()) return;
      if (method === "cod") {
        return this.placeCODOrder();
      }
      this.isProcessing = true;
      try {
        // ✅ STEP 1: Create order (PENDING)
        // 🛠️ Fixed bug: Added 'this.address.' prefixes to correctly target form state values
        const res = await fetch(`${this.baseURL}orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderItems: this.cart,
            shippingAddress1: this.address.shippingAddress1,
            shippingAddress2: this.address.shippingAddress2,
            city: this.address.city,
            zip: this.address.zip,
            country: this.address.country,
            phone: this.address.phone,
          }),
        });
        if (!res.ok) throw new Error("Order creation failed");
        const result = await res.json();
        const { orderId, totalPrice } = result;

        const gaClientId = this.getGAClientId(); // 👈 Grab GA ID

        // ✅ STEP 2: Paystack
        if (!window.PaystackPop) {
          throw new Error("Paystack not loaded");
        }
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: this.auth.user.email,
          amount: totalPrice * 100,
          currency: "NGN",
          metadata: {
            orderId: orderId, 
            gaClientId: gaClientId // 👈 Pack GA ID inside Paystack transaction metadata
          },
          callback: (response) => {
            this.verifyPayment(response.reference);
          },
          onClose: () => {
            this.isProcessing = false;
            this.$swal({ text: "Payment cancelled", icon: "info" });
          },
        });
        handler.openIframe();
      } catch (err) {
        console.error(err);
        this.$swal({ text: err.message, icon: "error" });
        this.isProcessing = false;
      }
    },
    // ✅ VERIFY PAYMENT
    async verifyPayment(reference) {
      try {
        const res = await fetch(
          `${this.baseURL}orders/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${this.auth.token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Verification failed");
        const data = await res.json();
        if (data.success) {
          this.$swal({
            text: "Payment successful!",
            icon: "success",
          });
          useCartStore().clearCart();
          this.$router.push({ name: "home" });
        } else {
          this.$swal({ text: "Payment failed", icon: "error" });
        }
      } catch (err) {
        console.error(err);
        this.$swal({ text: err.message, icon: "error" });
      } finally {
        // Automatically turns off processing spinner state
        this.isProcessing = false;
      }
    }
  },
};
</script>

