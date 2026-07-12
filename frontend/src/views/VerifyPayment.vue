<template>
  <div class="container text-center mt-5">
    <h3>Verifying Payment...</h3>
  </div>
</template>

<script>
import axios from "axios";

export default {
  async mounted() {
    const reference = this.$route.query.reference;

    if (!reference) {
      alert("No payment reference found");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/requests/verify-payment/${reference}`
      );

      if (res.data.success) {
        alert("Payment successful!");
        this.$router.push("/user-dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Payment verification failed");
    }
  },
};
</script>