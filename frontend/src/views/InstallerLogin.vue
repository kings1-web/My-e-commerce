
<template>
  <div class="container mt-5">
    <!-- Center the form on the screen using standard Bootstrap layouts -->
    <div class="row justify-content-center">
      <div class="col-md-5 col-lg-4">
        <div class="card shadow p-4 border-0 mt-5">
          <h3 class="card-title text-center mb-4 fw-bold text-success">Installer Login 🔐</h3>

          <form @submit.prevent="loginInstaller">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Email Address</label>
              <input v-model="email" type="email" class="form-control" placeholder="name@example.com" required />
            </div>

            <div class="mb-4">
              <label class="form-label small fw-semibold">Password</label>
              <input type="password" v-model="password" class="form-control" placeholder="••••••••" required />
            </div>

            <!-- Added a loading spinner state using a local boolean property -->
            <button class="btn btn-success w-100 py-2 fw-semibold" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isLoading ? 'Logging in...' : 'Sign In' }}
            </button>
          </form>

          <p class="mt-4 text-center mb-0 small text-muted">
            Don't have an account?
            <router-link to="/installer-register" class="text-success fw-semibold text-decoration-none">Register here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { useInstallerStore } from "@/stores/installer";

export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
props: ["baseURL"],
  methods: {
    async loginInstaller() {
      try {
        const store = useInstallerStore();

        await store.login(this.baseURL,{
          email: this.email,
          password: this.password,
        });

         this.$swal({
          text: "Login successfully",
          icon: "success",
        });

        // redirect to dashboard
        this.$router.push("/installer-dashboard");
      } catch (err) {
         this.$swal({
          text: "Login fail",
          icon: "warning",
        });
      }
    },
  },
};
</script>