import axios from "axios";
import { defineStore } from "pinia";
import { useAuthStore } from "./auth"; // 🟢 Import your master unified authentication state machine

export const useInstallerStore = defineStore("installer", {
  state: () => ({
    // This array holds the live data rows rendered by your table loop
    requests: [], 
    // 🟢 ADDED: Caches the installer's professional details for the dashboard header
    installer: null 
  }),
  actions: {
     async getRequests(baseURL) {
      const authStore = useAuthStore();
      
      if (!authStore.token) {
        console.warn("Blocking fetch: Token is missing from LocalStorage.");
        return;
      }

      try {
        // 🟢 PERFECT SYNC: Uses strict lowercase 'requests/requests' to match your backend!
        const res = await axios.get(`${baseURL}requests/requests`, {
          headers: {
            Authorization: `Bearer ${authStore.token}` // Passes the passport token securely
          }
        });

        this.requests = Array.isArray(res.data) ? res.data : [];
        
      } catch (err) {
        console.error("Axios installer requests lookup failure:", err);
        this.requests = [];
        throw err;
      }
    },
     async getInstallerProfile(baseURL) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await axios.get(`${baseURL}installers/profile/me`, {
          headers: {
            Authorization: `Bearer ${authStore.token}` // Passes the passport token securely
          }
        });
        
        this.installer = res.data;
        return res.data;
      } catch (err) {
        console.error("Failed to load technician self-profile metrics:", err);
        this.installer = null;
      }
    }
  }
});

