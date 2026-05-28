import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userId:localStorage.getItem('userId') || null,
    token:localStorage.getItem('token') || null,
    email:localStorage.getItem('email') || null,
    isAdmin:localStorage.getItem('isAdmin')==='true',
    sessionExpired:false
  }),
  getters:{
    isLoggedIn() {
  return !!this.token && !this.isTokenExpired;
},
    isTokenExpired:(state)=>{
      if(!state.token) return true;
      try{
        const decoded=jwtDecode(state.token);
        return decoded.exp * 1000 < Date.now();
      }catch(err){
        return true;
      }
    }
  },
  actions: {
    login({token, email}) {
      const decoded=jwtDecode(token);
      this.token=token;
      this.userId =decoded.userId;
      this.isAdmin=decoded.isAdmin;
      this.email=email
      this.sessionExpired=false;

      //store user and token in localstorage
      localStorage.setItem('token',token)
      localStorage.setItem('userId',decoded.userId);
      localStorage.setItem('isAdmin', decoded.isAdmin);
      localStorage.setItem('email', email);
    },
  
    logout() {
      this.userId = null;
      this.email = null;
      this.token = null;
      this.isAdmin=false;
      this.sessionExpired=false;

      //remove from localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    },
    checkTokenAndLogoutIfExpired(){
      if(this.isTokenExpired){
        this.logout();
        this.sessionExpired=true;
      }
    },
    
    loadFromStorage() {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (token) {
    const decoded = jwtDecode(token);

    this.token = token;
    this.userId = decoded.userId;
    this.isAdmin = decoded.isAdmin;
    this.email = email;
  }
}

  },
});
