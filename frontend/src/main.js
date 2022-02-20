import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import axios from "axios";
import VueAxios from "vue-axios";

import PrimeVue from "primevue/config";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Password from "primevue/password";
import PickList from "primevue/picklist";
import SplitButton from "primevue/splitbutton";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import ProgressBar from "primevue/progressbar";

import "primevue/resources/themes/nova/theme.css";
import "primevue/resources/primevue.min.css";

import "primeicons/primeicons.css";

const app = createApp(App);

app
  .use(PrimeVue)
  .component("AutoComplete", AutoComplete)
  .component("Button", Button)
  .component("Checkbox", Checkbox)
  .component("Column", Column)
  .component("DataTable", DataTable)
  .component("Dialog", Dialog)
  .component("InputText", InputText)
  .component("Message", Message)
  .component("MultiSelect", MultiSelect)
  .component("PickList", PickList)
  .component("Password", Password)
  .component("SplitButton", SplitButton)
  .component("Toast", Toast)
  .component("ProgressBar", ProgressBar)
  .use(ToastService)
  .use(VueAxios, axios)
  .use(router);

app.mount("#app");
