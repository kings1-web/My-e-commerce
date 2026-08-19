<template>
  <div class="terms-page bg-light py-5">
    <div class="container">
      
      <!-- HEADER -->
      <div class="text-center mb-5">
        <span class="badge bg-primary fw-bold mb-2 px-3 py-2">Legal Agreement</span>
        <h1 class="display-5 fw-bold text-dark mb-3">Terms & Conditions</h1>
        <p class="text-secondary max-w-700 mx-auto">
          Please read these terms carefully before using the ShoppersFix platform, purchasing products, or booking handyman services.
        </p>
      </div>

      <!-- MAIN CONTENT -->
      <div class="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-5 border">
        
        <!-- 1. General Overview -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">1. Acceptance of Terms</h4>
          <p class="text-muted">
            By accessing or using ShoppersFix (the "Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not access or use our e-commerce store or handyman booking services.
          </p>
        </section>

        <!-- 2. Marketplace & E-Commerce -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">2. E-Commerce Purchases & Payments</h4>
          <ul class="text-secondary ps-3">
            <li class="mb-2"><strong>Pricing:</strong> All product prices listed are in Nigerian Naira (NGN) and are subject to change without prior notice.</li>
            <li class="mb-2"><strong>Payment Options:</strong> Payments can be made via card gateways, direct transfer, or Pay on Delivery (where applicable).</li>
            <li><strong>Order Confirmation:</strong> Orders are subject to inventory verification. We reserve the right to refuse or cancel any order if an item is out of stock or mispriced.</li>
          </ul>
        </section>

        <!-- 3. Handyman Service Facilitation & Liability Disclaimer -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">3. Handyman Services & Limitation of Liability</h4>
          <p class="text-muted">
            ShoppersFix connects users with independent, background-checked technicians and handymen.
          </p>
          <ul class="text-secondary ps-3">
            <li class="mb-2"><strong>Independent Contractors:</strong> Handymen listed on our platform operate as independent service providers.</li>
            <li class="mb-2"><strong>Scope of Work:</strong> Any additional tasks agreed upon between the client and the technician outside the official booking must be documented through the platform.</li>
            <li><strong>Property Damage Disclaimer:</strong> While we vet all registered technicians, ShoppersFix is not directly liable for pre-existing structural issues or damages caused by unapproved modifications made directly between customer and technician without company consent.</li>
          </ul>
        </section>

        <!-- 4. User Conduct -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">4. User Account & Conduct</h4>
          <p class="text-muted m-0">
            You agree to provide accurate contact and delivery information. Misuse of the platform, fraudulent orders, or abusive behavior toward delivery agents or handymen will result in immediate termination of account access.
          </p>
        </section>

        <!-- 5. Governing Law -->
        <section>
          <h4 class="fw-bold text-dark mb-3">5. Governing Law</h4>
          <p class="text-muted m-0">
            These terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
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
  name: "Terms",
};
</script>

<style scoped>
.terms-page {
  min-height: 80vh;
}
.max-w-700 {
  max-width: 700px;
}
</style>