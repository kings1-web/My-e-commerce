<template>
  <div class="return-policy-page bg-light py-5">
    <div class="container">
      
      <!-- HERO HEADER -->
      <div class="text-center mb-5">
        <span class="badge bg-warning text-dark fw-bold mb-2 px-3 py-2">
          Customer Protection
        </span>
        <h1 class="display-5 fw-bold text-dark mb-3">Return & Refund Policy</h1>
        <p class="lead text-secondary max-w-700 mx-auto">
          At ShoppersFix, we aim to ensure complete satisfaction with every purchase and handyman service booking. Please review our policy guidelines below.
        </p>
      </div>

      <!-- KEY HIGHLIGHTS -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4 text-center">
            <div class="icon-box text-warning mb-3 fs-1">
              <i class="bi bi-calendar-check"></i>
            </div>
            <h5 class="fw-bold mb-2">7-Day Return Window</h5>
            <p class="text-muted small m-0">
              Eligible physical items can be returned or exchanged within 7 days of delivery.
            </p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4 text-center">
            <div class="icon-box text-success mb-3 fs-1">
              <i class="bi bi-shield-check"></i>
            </div>
            <h5 class="fw-bold mb-2">Defective / Wrong Items</h5>
            <p class="text-muted small m-0">
              Free replacement or full refund if you receive damaged, defective, or incorrect products.
            </p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4 text-center">
            <div class="icon-box text-primary mb-3 fs-1">
              <i class="bi bi-arrow-repeat"></i>
            </div>
            <h5 class="fw-bold mb-2">Quick Refunds</h5>
            <p class="text-muted small m-0">
              Refunds are processed within 3–5 business days following product inspection.
            </p>
          </div>
        </div>
      </div>

      <!-- POLICY DETAILS -->
      <div class="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-5 border">
        
        <!-- 1. Eligibility -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">
            <i class="bi bi-1-circle text-warning me-2"></i>1. Eligibility Criteria for Product Returns
          </h4>
          <p class="text-muted">
            To qualify for a return or replacement, the item must meet the following conditions:
          </p>
          <ul class="text-secondary ps-3">
            <li class="mb-2">Returned within <strong>7 days</strong> from the delivery date.</li>
            <li class="mb-2">Unused, unaltered, and in the same condition as received.</li>
            <li class="mb-2">In original packaging with all included accessories, manuals, and tags.</li>
            <li>Accompanied by the original receipt, invoice, or digital order number.</li>
          </ul>
        </section>

        <!-- 2. Non-Returnable Items -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">
            <i class="bi bi-2-circle text-warning me-2"></i>2. Non-Returnable Items
          </h4>
          <p class="text-muted">
            For quality, hygiene, and technical reasons, the following items cannot be returned unless verified as defective upon arrival:
          </p>
          <ul class="text-secondary ps-3">
            <li class="mb-2">Custom-cut wiring, cables, or customized plumbing fittings.</li>
            <li class="mb-2">Products damaged due to improper self-installation or electrical surges.</li>
            <li>Clearance, sale, or final-purchase items explicitly marked non-refundable.</li>
          </ul>
        </section>

        <!-- 3. Handyman Services Policy -->
        <section class="mb-4 pb-4 border-bottom">
          <h4 class="fw-bold text-dark mb-3">
            <i class="bi bi-3-circle text-warning me-2"></i>3. Handyman & Installation Services
          </h4>
          <p class="text-muted">
            We hold our technicians to the highest standards:
          </p>
          <ul class="text-secondary ps-3">
            <li class="mb-2">
              <strong>Service Guarantee:</strong> If an installation or repair completed by a ShoppersFix technician fails due to poor workmanship within <strong>48 hours</strong>, we will re-inspect and correct the issue at no extra charge.
            </li>
            <li>
              <strong>Cancellations:</strong> Booking appointments can be rescheduled or canceled without fee up to 2 hours prior to the technician's departure.
            </li>
          </ul>
        </section>

        <!-- 4. How to Request a Return -->
        <section>
          <h4 class="fw-bold text-dark mb-3">
            <i class="bi bi-4-circle text-warning me-2"></i>4. How to Initiate a Return
          </h4>
          <ol class="text-secondary ps-3">
            <li class="mb-2">Contact our customer support team via WhatsApp or phone call.</li>
            <li class="mb-2">Provide your order number, product photo/video demonstrating any fault.</li>
            <li>Once approved, schedule a pickup or drop off the product at our designated Area  hub.</li>
          </ol>
        </section>

      </div>

      <!-- SUPPORT CTA BANNER -->
      <div class="bg-dark text-white rounded-4 p-4 text-center shadow-sm">
        <h4 class="fw-bold mb-2">Need Help With an Order or Return?</h4>
        <p class="small text-light-50 mb-3">Our team is available 24/7 to assist with claims and replacements.</p>
        <div class="d-flex justify-content-center gap-3">
          <a href="https://wa.link/3pxzcs" target="_blank" class="btn btn-success fw-bold px-4 py-2">
            <i class="bi bi-whatsapp me-1"></i> Contact Support
          </a>
          <RouterLink to="/" class="btn btn-outline-light fw-bold px-4 py-2">
            Back to Marketplace
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "ReturnPolicy",
};
</script>

<style scoped>
.return-policy-page {
  min-height: 80vh;
}

.max-w-700 {
  max-width: 700px;
}
</style>