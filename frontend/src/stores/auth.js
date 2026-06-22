import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userId: localStorage.getItem('userId') || null,
    token: localStorage.getItem('token') || null,
    email: localStorage.getItem('email') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    // 🟢 ADDED: Hydrate user role array layers straight out of local cache storage
    roles: JSON.parse(localStorage.getItem('userRoles')) || ["customer"],
    sessionExpired: false
  }),
  getters: {
    isLoggedIn() {
      return !!this.token && !this.isTokenExpired;
    },
    isTokenExpired: (state) => {
      if (!state.token) return true;
      try {
        const decoded = jwtDecode(state.token);
        return decoded.exp * 1000 < Date.now();
      } catch (err) {
        return true;
      }
    }
  },
  actions: {
    login({ token, email }) {
      const decoded = jwtDecode(token);
      this.token = token;
      this.userId = decoded.userId;
      this.isAdmin = decoded.isAdmin;
      this.email = email;
      // 🟢 ADDED: Extract the multi-role list from your newly upgraded backend JWT claims
      this.roles = decoded.roles || ["customer"];
      this.sessionExpired = false;

      // Store credentials cleanly across local browser memory slots
      localStorage.setItem('token', token);
      localStorage.setItem('userId', decoded.userId);
      localStorage.setItem('isAdmin', decoded.isAdmin);
      localStorage.setItem('email', email);
      // 🟢 ADDED: Save roles list stringified so arrays preserve format boundaries
      localStorage.setItem('userRoles', JSON.stringify(this.roles));
    },
  
    logout() {
      this.userId = null;
      this.email = null;
      this.token = null;
      this.isAdmin = false;
      this.roles = []; // Clear array values
      this.sessionExpired = false;

      // Complete cleanup across all local storage parameters
      localStorage.clear(); // 🟢 FIXED: Clears everything cleanly to prevent stale installer/user state overlaps
    },
    checkTokenAndLogoutIfExpired() {
      if (this.isTokenExpired) {
        this.logout();
        this.sessionExpired = true;
      }
    },
    
    loadFromStorage() {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');

      if (token) {
        try {
          const decoded = jwtDecode(token);
          this.token = token;
          this.userId = decoded.userId;
          this.isAdmin = decoded.isAdmin;
          this.email = email;
          // 🟢 ADDED: Fallback restore array values out of storage on page reloads
          this.roles = decoded.roles || JSON.parse(localStorage.getItem('userRoles')) || ["customer"];
        } catch (err) {
          console.error("Failed to parse cached session token claims:", err);
          this.logout();
        }
      }
    }
  },
});

