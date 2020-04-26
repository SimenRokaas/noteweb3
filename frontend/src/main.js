import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

Vue.use(ToastService);

Vue.component("Button", Button);
Vue.component("Checkbox", Checkbox);
Vue.component("Column", Column);
Vue.component("DataTable", DataTable);
Vue.component("InputText", InputText);
Vue.component("Message", Message);
Vue.component("Toast", Toast);

import "primevue/resources/themes/nova-light/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router
}).$mount("#app");
