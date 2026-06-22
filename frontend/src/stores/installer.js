import { defineStore } from "pinia";
import axios from "axios";

export const useInstallerStore = defineStore("Installer", {
  state: () => ({
    installer: JSON.parse(localStorage.getItem("installerData")) || null,
    token: localStorage.getItem("installerToken") || null,
    requests: [],
  }),

  actions: {
    async register(baseURL, data) {
      return await axios.post(`${baseURL}installers/register`, data);
    },

    async login(baseURL, data) {
      const res = await axios.post(`${baseURL}installers/login`, data);
      this.installer = res.data.installer;
      this.token = res.data.token;

      localStorage.setItem("installerToken", this.token);
      localStorage.setItem("installerData", JSON.stringify(this.installer));
    },

    async getRequests(baseURL) {
  const res = await axios.get(`${baseURL}Requests/requests`, { // ✅ Targets Requests/requests path namespace
    headers: {
      Authorization: `Bearer ${this.token}`,
    },
  });
  this.requests = res.data;
},


    // NEW ACTION: Handles backend photo swap and updates frontend local state synchronously
    async updateProfileImage(baseURL, file) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.put(`${baseURL}installers/profile/image`, formData, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      this.installer = res.data.installer;
      localStorage.setItem("installerData", JSON.stringify(this.installer));
      return res.data;
    },

    logout() {
      this.installer = null;
      this.token = null;
      this.requests = [];
      localStorage.removeItem("installerToken");
      localStorage.removeItem("installerData");
    },
  },
});
