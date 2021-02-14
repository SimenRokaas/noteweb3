import { createRouter, createWebHistory } from "vue-router";

import Login from "@/components/Login";
import Noter from "@/components/noter/Noter";

const router = createRouter({
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
  ],
});
export default router;
