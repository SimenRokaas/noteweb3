import { createRouter, createWebHashHistory } from "vue-router";

import Login from "@/components/Login";
import Noter from "@/components/noter/Noter";
import Nedlastinger from "@/components/noter/Nedlastinger";

export default createRouter({
  history: createWebHashHistory(),
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
