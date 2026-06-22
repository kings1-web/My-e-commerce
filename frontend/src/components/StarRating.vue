<template>
  <div class="mt-3 container">
    <h5>Leave a Review</h5>

    <!-- Stars -->
   
    <div>
      <span v-for="star in 5" :key="star" @click="rating = star">
        <i
          :class="
            star <= rating ? 'bi bi-star-fill text-warning' : 'bi bi-star'
          "
        ></i>
      </span>
    </div>

    <!-- Comment -->
    <textarea v-model="comment" class="form-control mt-2"></textarea>

    <button class="btn btn-primary mt-2" @click="submitReview(installer._id)">
      Submit Review
    </button>
  </div>
  <!--display Review-->
  <div class="mt-4 container">
    <h5>Reviews</h5>

    <div v-for="rev in reviews" :key="rev._id" class="border p-2 mb-2">
      <strong>{{ rev.user?.name }}</strong>

      <div>
        <span v-for="i in 5" :key="i">
          {{ i <= rev.rating ? "★" : "☆" }}
        </span>
      </div>

      <p>{{ rev.comment }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rating: 0,
      comment: "",
      reviews: [],
    };
  },

  async getReviews(installerId) {
    const res = await axios.get(`/api/reviews/${installerId}`);
    this.reviews = res.data;
  },

  async submitReview(installerId) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/reviews",
        {
          installerId,
          rating: this.rating,
          comment: this.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Review submitted!");
      this.getReviews(installerId);
    } catch (err) {
      alert("Error submitting review");
    }
  },
};
</script>
