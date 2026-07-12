import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userId: localStorage.getItem('userId') || null,
    token: localStorage.getItem('token') || null,
    email: localStorage.getItem('email') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    sessionExpired: false,
    
    // 🟢 HYDRATED ROLES POOL: Safely parses array properties without crashing on empty values
    roles: (() => {
      try {
        const data = localStorage.getItem('userRoles');
        return data ? JSON.parse(data) : ["customer"];
      } catch (e) {
        return ["customer"];
      }
    })(),

    // 🟢 HYDRATED USER DETAILS (FIXED COLLISION): Merged into a single safe-parse wrapper object properties
    user: (() => {
      try {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    })(),
    
    currentActiveView: localStorage.getItem("currentActiveView") || "customer"
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
    // 🟢 ACTION INVOCATION HANDLER: Maps matching elements directly down from backend responses
    login({ token, email, roles, userId, userDetails, isAdmin }) {
      this.token = token;
      this.userId = userId; 
      this.user = userDetails || null; // This now safely holds name, email, isApproved, and phone!
      this.isAdmin = isAdmin || false;
      this.email = email || (userDetails ? userDetails.email : null);
      this.roles = roles || ["customer"];
      this.sessionExpired = false;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('isAdmin', this.isAdmin);
      localStorage.setItem('email', this.email);
      localStorage.setItem('userRoles', JSON.stringify(this.roles));
      localStorage.setItem('userData', JSON.stringify(this.user)); // Persists phone properties cleanly
    },

    setActiveViewMode(viewName) {
      this.currentActiveView = viewName;
      localStorage.setItem("currentActiveView", viewName);
    },
  
    logout() {
      this.userId = null;
      this.email = null;
      this.token = null;
      this.isAdmin = false;
      this.roles = [];
      this.user = null;
      this.sessionExpired = false;
      this.currentActiveView = "customer";

      // Complete cleanup across all local storage parameters
      localStorage.clear(); 
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
          this.userId = decoded.userId || decoded.id;
          this.isAdmin = decoded.isAdmin || false;
          this.email = email;
          
          const cachedRoles = localStorage.getItem('userRoles');
          this.roles = cachedRoles ? JSON.parse(cachedRoles) : (decoded.roles || ["customer"]);
          this.user = JSON.parse(localStorage.getItem('userData')) || null;
        } catch (err) {
          console.error("Failed to parse cached session token claims:", err);
          this.logout();
        }
      }
    }
  },
});
