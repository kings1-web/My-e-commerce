<template>
    <div style="background-color: black;color: aliceblue; position: relative; justify-items: center;">
        <form  class="row g-3 col-6 text-start">
<h3>Billing Address</h3>
<div class="col-12">
  <label for="inputAddress" class="form-label">Address</label>
  <input type="text" class="form-control" 
  id="inputAddress" placeholder="1234 Main St" v-model="address.shippingAddress1" required>
</div>
<div class="col-12">
  <label for="inputAddress2" class="form-label">Address 2</label>
  <input type="text" class="form-control" 
  id="inputAddress2" placeholder="Apartment, studio, or floor" v-model="address.shippingAddress2" required>
</div>
<div class="col-md-6">
  <label for="inputCity" class="form-label">City</label>
  <input type="text" class="form-control" id="inputCity" v-model="address.city" required>
</div>
<div class="col-md-4">
  <label for="inputState" class="form-label">State</label>
  <select id="inputState" class="form-select" v-model="address.country" required>
    <option selected>Choose...</option>
    <option>ondo</option>
    <option>lagos</option>
    <option>ibadan</option>
  </select>
</div>
<div class="col-md-2">
  <label for="inputZip" class="form-label">Zip</label>
  <input type="text" class="form-control" id="inputZip" v-model="address.zip" required>
</div>
<div class="col-12">
  <div class="form-check">
      <label class="form-label" for="phone" >
      phone no:
    </label>
    <input class="form-control" type="text" id="phone" v-model="address.phone" required>
  </div>
  </div>
 
<div class="col-12">
  <button type="button" class="btn btn-primary" @click="goToCheckOut('paystack')">Pay Now</button>
</div>
<div class="col-12">
  <button type="button" class="btn btn-primary" @click="goToCheckOut('cod')">Pay On delievery</button>
</div>
</form>
    </div>


</template>



<script>
import { useCartStore } from '@/stores/CartStore';  // Assuming you're using Pinia or Vuex

export default {
  data() {
    return {
      token: localStorage.getItem('token'),  // Assuming JWT token is stored in localStorage
      address: {
        shippingAddress1: "",
        shippingAddress2: "",
        city: "",
        zip: "",
        country: "",
        phone: "",
        user: localStorage.getItem('userId') || null,
        email: localStorage.getItem('email') || null,
      },
    };
  },
  props:["baseURL"],
  computed: {
    cart() {
      const cartStore = useCartStore();
      return cartStore.cart;
    },
  },
  methods: {
    async goToCheckOut(method) {
      if (!this.cart.length) {
        this.$swal({
             text:"Cart is empty!",
             icon:"error"
              });
       // alert("Cart is empty");
        return;
      }

       if (method === 'cod') {
    return this.placeCODOrder(); // 👈 NEW
       }

      // Step 1: Create order
      const res = await fetch(`${this.baseURL}orders/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItems: this.cart,  // Pass the cart items to backend
        }),
      });

      const result = await res.json();

      if (!result.success) {
        this.$swal({
             text:"Failed to create order!",
             icon:"error"
              });
        //alert('Failed to create order');
        return;
      }

      const { totalPrice, orderItems } = result;

      // Step 2: Trigger Paystack
      const handler = PaystackPop.setup({
        key: 'pk_test_72fa0a4bc46c54a074a544b188865ddcbe457cf0',  // Replace with your Paystack public key
        email: this.address.email,
        amount: totalPrice * 100,  // Paystack expects amount in kobo
        currency: 'NGN',
        ref: '' + Math.floor(Math.random() * 1000000000 + 1),  // Random reference number
        metadata: {
          orderItems,
          shipping: {
            shippingAddress1: this.address.shippingAddress1,
            shippingAddress2: this.address.shippingAddress2,
            city: this.address.city,
            zip: this.address.zip,
            country: this.address.country,
            phone: this.address.phone,
          },
          user: this.address.user,
          totalPrice: totalPrice,
        },
        callback: (response) => {
          this.verifyAndSaveOrder(response.reference);  // Verify payment after successful callback
        },
        onClose: () => {
          alert('Transaction was cancelled');
        },
      });
      handler.openIframe();
    },

    // Verify the payment and save the order
    async verifyAndSaveOrder(reference) {
      try {
        const res = await fetch(`${this.baseURL}orders/verify/${reference}`);
        const data = await res.json();

        if (data.success) {
           this.$swal({
             text:"Payment successful and order saved!",
             icon:"success"
              });
              
     
    
         // alert('');

          // 1. Clear cart
          const cartStore = useCartStore();
          cartStore.clearCart();

          // 2. Redirect to success page
          this.$router.push({ name: 'home' });  // Ensure this route is configured in Vue Router
        } else {
          this.$swal({
             text:"Verification failed!",
             icon:"error"
              });
        }
      } catch (err) {
        console.error('Verify order error:', err);
        this.$swal({
             text:"server error during verification!",
             icon:"error"
              });
       // alert('Server error during verification.');
      }
    },

    async placeCODOrder() {
  try {
    const res = await fetch(`${this.baseURL}orders/cod`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderItems: this.cart,
        shippingAddress1: this.address.shippingAddress1,
        shippingAddress2: this.address.shippingAddress2,
        city: this.address.city,
        zip: this.address.zip,
        country: this.address.country,
        phone: this.address.phone,
        user: this.address.user,
      }),
    });

    const data = await res.json();

    if (data.success) {
      this.$swal({
        text: "Order placed! Pay on delivery.",
        icon: "success"
      });

      const cartStore = useCartStore();
      cartStore.clearCart();

      this.$router.push({ name: 'home' });
    }
  } catch (err) {
    console.error(err);
    this.$swal({
      text: "Error placing COD order",
      icon: "error"
    });
  }
},

  },
};
</script>
