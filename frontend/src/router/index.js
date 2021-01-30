import Vue from "vue";
import VueRouter from "vue-router";

import Login from "@/components/Login";
import Noter from "@/components/noter/Noter";

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Login",
      component: Login,
    },
    {
      path: "/noter/",
      name: "Noter",
      component: Noter,
    },
  ],
});
