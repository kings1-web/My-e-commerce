import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userId:localStorage.getItem('userId') || null,
    token:localStorage.getItem('token') || null,
    isAdmin:localStorage.getItem('isAdmin')==='true',
    sessionExpired:false
  }),
  getters:{
    isLoggedIn:(state)=>!!state.token && !state.isTokenExpired,
    isTokenExpired:(state)=>{
      if(!state.token) return true;
      try{
        const decoded=jwtDecode(state.token);
        return decoded.exp < Date.now() / 1000;
      }catch(err){
        return true;
      }
    }
  },
  actions: {
    login(token) {
      const decoded=jwtDecode(token);
      this.token=token;
      this.userId =decoded.userId;
      this.isAdmin=decoded.isAdmin;
      this.sessionExpired=false;

      //store user and token in localstorage
      localStorage.setItem('token',token)
      localStorage.setItem('userId',decoded.userId);
      localStorage.setItem('isAdmin', decoded.isAdmin);
    },
  
    logout() {
      this.userId = null;
      this.token = null;
      this.isAdmin=false;
      this.sessionExpired=false;
      localStorage.clear();

      //remove from localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    },
    checkTokenAndLogoutIfExpired(){
      if(this.isTokenExpired){
        this.logout();
        this.sessionExpired=true;
      }
    },
    loadFromStorage(){
      const token=localStorage.getItem('token');
      if(token)this.login(token)
    }
  },
});
