<template>
  <div class="text-center bg-dark text-white w-100 h-100">
    <div v-if="authStore.sessionExpired" class="alert alert-warning">
      Session expired. plaese log in again.
    </div>
    <div class="row">
      <div class="col-12 justify-content-center d-flex flex-row pt-5">
        <div id="login" class="flex-item border">
          <h2 class="pt-4">Sign In</h2>
          <form @submit.prevent="login" class="form-group pt-4 pl-4 pr-4">
            <div class="form-group">
              <label>Email</label>
              <input v-model="email" type="email" class="form-control" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
              />
            </div>
            
            <button
              :disabled="loading"
              type="submit"
              class="btn btn-primary mt-2 py-0"
            >
              Continue
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary bg-white d-flex flex-end"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "🙈" : "👁" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";
import { useCartStore } from "@/stores/CartStore";
export default {
  props: ["baseURL"],
  data() {
    return {
      authStore: useAuthStore(),
      email: null,
      password: null,
      loading: false,
      showPassword: false, // 👈 add this
    };
  },

  methods: {
    async login(e) {
      if (!this.email || !this.password) {
        this.$swal({
          text: "Please fill all fields",
          icon: "warning",
        });
        return;
      }

      try {
        const body = {
          email: this.email,
          password: this.password,
        };

        const res = await axios.post(`${this.baseURL}users/login`, body);

        const authStore = useAuthStore();
        authStore.login({
          token: res.data.token,
          userId: res.data.user._id,
          email: res.data.user.email,
          isAdmin: res.data.user.isAdmin,
        });

        const cartStore = useCartStore();
        cartStore.loadCartForUser(authStore.userId);

        this.$emit("fetchData");

        this.$router.push({ name: "home" });

        this.$swal({
          text: "Login successfully",
          icon: "success",
        });
      } catch (err) {
        console.log("err", err);
      }
    },
  },
  mounted() {
    this.$emit("fetchData");
    this.$emit("updateCart");
  },
};
</script>

<style scoped>
.btn-primary {
  background-color: #f0c14b;
  color: black;
}
@media screen and (min-width: 992px) {
  #login {
    width: 40%;
  }
}
</style>
