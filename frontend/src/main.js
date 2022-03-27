import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import axios from "axios";
import VueAxios from "vue-axios";

import PrimeVue from "primevue/config";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Calendar from "primevue/calendar";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Password from "primevue/password";
import PickList from "primevue/picklist";
import ProgressBar from "primevue/progressbar";
import SplitButton from "primevue/splitbutton";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

import "primevue/resources/themes/nova/theme.css";
import "primevue/resources/primevue.min.css";

import "primeicons/primeicons.css";

const app = createApp(App);

app
  .use(PrimeVue, {
    locale: {
      dayNames: [
        "Søndag",
        "Mandag",
        "Tirsdag",
        "Onsdag",
        "Torsdag",
        "Fredag",
        "Lørdag",
      ],
      dayNamesShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
      dayNamesMin: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"],
      monthNames: [
        "Januar",
        "Februar",
        "Mars",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
      monthNamesShort: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ],
      today: "Idag",
      weekHeader: "Uke",
      firstDayOfWeek: 1,
      dateFormat: "dd/mm/yy",
    },
  })
  .component("AutoComplete", AutoComplete)
  .component("Button", Button)
  .component("Calendar", Calendar)
  .component("Checkbox", Checkbox)
  .component("Column", Column)
  .component("DataTable", DataTable)
  .component("Dialog", Dialog)
  .component("InputText", InputText)
  .component("Message", Message)
  .component("MultiSelect", MultiSelect)
  .component("Password", Password)
  .component("PickList", PickList)
  .component("ProgressBar", ProgressBar)
  .component("SplitButton", SplitButton)
  .component("Toast", Toast)
  .use(ToastService)
  .use(VueAxios, axios)
  .use(router);

app.mount("#app");
