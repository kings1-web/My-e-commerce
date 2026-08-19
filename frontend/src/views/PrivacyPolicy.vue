<template>
  <div class="privacy-page bg-light py-5">
    <div class="container">
      
      <!-- HEADER -->
      <div class="text-center mb-5">
        <span class="badge bg-success fw-bold mb-2 px-3 py-2">Data Protection</span>
        <h1 class="display-5 fw-bold text-dark mb-3">Privacy Policy</h1>
        <p class="text-secondary max-w-700 mx-auto">
          Learn how ShoppersFix collects, uses, and safeguards your personal information in compliance with the Nigeria Data Protection Regulation (NDPR).
        </p>
      </div>

      <!-- MAIN CONTENT -->
      <div class="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-5 border">
        
        <!-- 1. Information Collected -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">1. Information We Collect</h4>
          <p class="text-muted">We collect information needed to fulfill orders and book handyman services, including:</p>
          <ul class="text-secondary ps-3">
            <li class="mb-2"><strong>Personal Details:</strong> Name, phone number, email address, and physical delivery/service address.</li>
            <li class="mb-2"><strong>Transaction Data:</strong> Order details, booking history, and payment status (we do NOT store credit card details directly; all transactions are processed through encrypted payment gateways).</li>
            <li><strong>Technical Data:</strong> IP address, browser type, and cookie preferences used to improve site performance.</li>
          </ul>
        </section>

        <!-- 2. How Data is Used -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">2. How We Use Your Data</h4>
          <ul class="text-secondary ps-3">
            <li class="mb-2">To process product orders and deliver packages to your specified address.</li>
            <li class="mb-2">To assign and connect you with nearby verified handymen for your booked service requests.</li>
            <li class="mb-2">To send automated order confirmations, status updates via SMS/WhatsApp, and customer support communications.</li>
            <li>To analyze website traffic using tools like Google Analytics to improve platform user experience.</li>
          </ul>
        </section>

        <!-- 3. Third-Party Sharing -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">3. Data Sharing & Security</h4>
          <p class="text-muted">
            We do NOT sell or rent your personal data to third parties. Information is shared strictly with:
          </p>
          <ul class="text-secondary ps-3">
            <li class="mb-2"><strong>Logistics & Delivery Partners:</strong> To fulfill hardware deliveries.</li>
            <li class="mb-2"><strong>Assigned Technicians:</strong> Contact details and location are shared only with the specific handyman assigned to your service request.</li>
            <li><strong>Payment Processors:</strong> Secured payment partners (e.g., Paystack/Flutterwave).</li>
          </ul>
        </section>

        <!-- 4. Your Rights -->
        <section>
          <h4 class="fw-bold text-dark mb-3">4. Your Data Rights</h4>
          <p class="text-muted m-0">
            You have the right to request access to your personal data, request corrections, or ask for account deletion at any time by contacting our support team via WhatsApp or email.
          </p>
        </section>

      </div>

      <!-- FOOTER CTA -->
      <div class="text-center">
        <RouterLink to="/" class="btn btn-outline-dark fw-bold px-4 py-2">
          Back to Home
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "PrivacyPolicy",
};
</script>

<style scoped>
.privacy-page {
  min-height: 80vh;
}
.max-w-700 {
  max-width: 700px;
}
</style>