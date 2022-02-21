import { createRouter, createWebHistory } from "vue-router";

import Login from "@/components/Login";
import Noter from "@/components/noter/Noter";
import Nedlastinger from "@/components/noter/Nedlastinger";

export default createRouter({
  history: createWebHistory(),
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
    {
      path: "/nedlastinger/",
      name: "Nedlastinger",
      component: Nedlastinger,
    },
  ],
});
