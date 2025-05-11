
 <template>
  <div class="row">
    <div v-for="product in products" :key="product.id" class="col-md-6 col-xl-3 col-6 pt-3 d-flex">
      <div class="card product-card w-100">
        <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
          <img :src="product.image" class="card-img-top product-img" alt="product image" />
        </router-link>
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
              <h6 class="card-title text-capitalize">
                {{ product.name.length > 25 ? product.name.substring(0, 25) + '...' : product.name }}
              </h6>
            </router-link>
            <p class="card-text price-text">{{ formatPrice(product.price) }}</p>
            <p class="card-text brand-text">
              <strong>Brand:</strong> {{ product.brand.length > 15 ? product.brand.substring(0, 15) : product.brand }}
            </p>
          </div>
          <div v-if="$route.name === 'AdminProduct'" class="mt-3 d-flex justify-content-between">
            <RouterLink :to="{ name: 'EditProduct', params: { id: product.id } }">
              <button class="btn btn-primary btn-sm">Edit</button>
            </RouterLink>
            <RouterLink :to="{ name: 'GalleryUpload', params: { id: product.id } }">
              <button class="btn btn-primary btn-sm">Upload</button>
            </RouterLink>
            <button class="btn btn-danger btn-sm" @click="deleteProduct(product.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




<script>
import axios from 'axios';

export default {
  name: 'FeaturedCarousel',
  props: {
    count: {
      type: Number,
      default:20
    },
    baseURL: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      products: []
    };
  },
  methods: {
    featured() {
      axios.get(`${this.baseURL}products/get/featured/${this.count}`)
        .then(res => {
          this.products = res.data;
        })
        .catch(err => {
          console.error('Failed to load featured products:', err);
        });
    },
    formatPrice(value){
    return new Intl.NumberFormat('en-NG',{
      style:'currency',
      currency:'NGN',
      maximumFractionDigits:2
    }).format(value);
  },
    deleteProduct(id) {
      axios.delete(`${this.baseURL}products/delete/${id}`)
        .then(() => {
          this.products = this.products.filter(p => p.id !== id);
        })
        .catch(err => console.error('Delete failed:', err));
    }
  },
  mounted() {
    this.featured();
  }
};
</script>


        

<style scoped>
.product-card {
  border: 1px solid #ddd;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: scale(1.02);
}
.product-img {
  max-width: 100%;
  height: 200px;
  object-fit: cover;
}
.price-text {
  color: #444;
  font-weight: 600;
}
.brand-text {
  font-size: 0.9rem;
  color: #444;
}
a{
  text-decoration: none;
  color:#000
}
</style>

