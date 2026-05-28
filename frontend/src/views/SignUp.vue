<template>
  <div class="bg-dark text-white">
    <div class="row">
      <div class="col-12 text-center pt-3">
        <!--  display logo -->
      </div>
    </div>

    <!-- display header -->

    <div class="row">
      <div class="col-12 text-center pt-3">
        <div id="signup-div" class="flex-item-border">
          <h2 class="pt-4 pl-4">Create Account</h2>
          <form @submit="signup" class="row g-3">
            <div class="col-md-6">
              <label for="inputEmail4" class="form-label">Email</label>
              <input
                type="email"
                v-model="email"
                class="form-control"
                id="inputEmail4"
                required
              />
            </div>
            <div class="col-md-6">
              <label for="inputPassword4" class="form-label">Password</label>
              <input
                type="password"
                v-model="password"
                class="form-control"
                id="Password"
                required
              />
            </div>

            <div class="col-12">
              <label for="inputAddress" class="form-label">Name</label>
              <input
                type="text"
                v-model="name"
                class="form-control"
                id="name"
                placeholder="FullName"
                required
              />
            </div>
            <div class="col-12">
              <label for="inputAddress2" class="form-label">Phone no:</label>
              <input
                type="text"
                v-model="phone"
                class="form-control"
                id="inputAddre"
                placeholder="+234"
                required
              />
            </div>
            <div class="col-md-6">
              <label for="inputAddress" class="form-label">Street</label>
              <input
                type="text"
                v-model="street"
                class="form-control"
                id="inputAddress"
                placeholder="1234 Main St"
                required
              />
            </div>
            <div class="col-md-6">
              <label for="inputAddress2" class="form-label">Apartment</label>
              <input
                type="text"
                v-model="apartment"
                class="form-control"
                id="inputAddress2"
                placeholder="Apartment, studio, or floor"
                required
              />
            </div>
            <div class="col-md-6">
              <label for="inputCity" class="form-label">City</label>
              <input
                type="text"
                v-model="city"
                class="form-control"
                id="inputCity"
                required
              />
            </div>
            <div class="col-md-4">
              <label for="inputState" class="form-label">State</label>
              <select id="inputState" v-model="country" class="form-select">
                <option selected>Choose...</option>
                <option>...</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="inputZip" class="form-label">Zip</label>
              <input
                type="text"
                v-model="zip"
                class="form-control"
                id="inputZip"
              />
            </div>
            <div class="col-12">
              <div class="form-check">
                <input
                  class="form-check-input"
                  v-model="isAdmin"
                  type="checkbox"
                  id="gridCheck"
                />
                <label class="form-check-label" for="gridCheck"> Admin </label>
              </div>
            </div>
            <div class="col-12">
              <button type="button" class="btn btn-primary" @click="signup">
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- display form -->
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: ["baseURL"],
  data() {
    return {
      name: null,
      email: null,
      password: null,
      phone: null,
      isAdmin: false,
      street: null,
      apartment: null,
      zip: null,
      city: null,
      country: null,
    };
  },
  methods: {
    async signup(e) {
        e.preventDefault();
      //call sihnup api
      const user = {
        name: this.name,
        email: this.email,
        password: this.password,
        phone: this.phone,
        isAdmin: this.isAdmin,
        street: this.street,
        apartment: this.apartment,
        zip: this.zip,
        city: this.city,
        country: this.country,
      };
      console.log("user", user);
      await axios
        .post(`${this.baseURL}users/register`,user)
        .then(() => {
          this.$router.replace("/");
          this.$swal({
            text: "user signup successfully, please login to your account",
            icon: "success",
          });
        })
        .catch((err) => console.log("err", err));
    },
  },
};
</script>

<style scoped>
.btn-primary {
  background-color: #f0c14b;
  color: #000;
}
</style>
