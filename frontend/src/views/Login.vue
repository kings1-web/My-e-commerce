<template>
  <div class="container text-center">
    <div class="row">
      <div class="col-12 justify-content-center d-flex flex-row pt-5">
        <div id="login" class="flex-item border">
          <h2 class="pt-4">Sign In</h2>
          <form @submit="login" class="form-group pt-4 pl-4 pr-4">
            <div class="form-group">
              <label>Email</label>
              <input v-model="email" type="email" class="form-control" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input v-model="password" type="password" class="form-control" />
            </div>
            <button class="btn btn-primary mt-2 py-0">Continue</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  props: ["baseURL"],
  data() {
    return {
      email: null,
      password: null,
    };
  },
  methods: {
    async login(e) {
        e.preventDefault();
      const body = {
        email: this.email,
        password: this.password,
      };
      await axios.post(`${this.baseURL}users/login`, body)
      .then((res) => {
        localStorage.setItem("token",res.data.token);
        this.$swal({
          text: "login successfully",
          icon: "success",
        });
        this.$emit("fetchData")
        this.$router.push({ name: "home"});
      }).catch((err) => console.log("err", err));
    },
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
