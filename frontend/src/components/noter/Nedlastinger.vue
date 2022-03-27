<template>
  <h3>Nedlastinger</h3>
  <Button
    icon="pi pi-arrow-circle-left"
    label="Tilbake"
    @click="$router.push({ name: 'Noter' })"
    style="margin-right: 4px"
    class="p-button-warning"
  />
  <Button
    icon="pi pi-database"
    label="Parse logg"
    @click="parseLog()"
    style="margin-right: 4px"
    class="p-button-success"
  />
  <DataTable
    :filters="filters"
    :loading="loading"
    :paginator="true"
    :resizable-columns="true"
    :reorderableColumns="true"
    :row-hover="true"
    :rows="15"
    :rows-per-page-options="[15, 30, 60, 100]"
    :sort-order="-1"
    :value="nedlastinger"
    auto-layout
    class="p-datatable-striped"
    csv-separator="|"
    current-page-report-template="Viser {first} til {last} av {totalRecords} nedlastinger"
    dataKey="ArkivNr"
    export-filename="nedlastinger"
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    ref="dt"
    id="nedlastingstabell"
    selection-mode="single"
    sort-field="kolArkivNr"
  >
    <template #header>
      <table>
        <tr>
          <td style="float: left">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="filters['global'].value"
                placeholder="Fritekst søk"
                size="40"
              />
            </span>
            <Checkbox
              id="alleKolonner"
              v-model="visAlleKolonner"
              :binary="true"
              style="margin-bottom: 5px; margin-left: 10px"
              v-on:change="onVisAlleKolonner()"
            />
            <label
              for="alleKolonner"
              class="p-checkbox-label"
              style="font-size: 14px; margin-right: 40px"
            >
              Vis/søk i alle kolonner
            </label>
            <label for="fra" style="font-size: 14px; margin-right: 4px">
              Periode
            </label>
            <Calendar
              id="fra"
              v-model="fra"
              dateFormat="dd.mm.yy"
              style="width: 135px"
              :showIcon="true"
            />
            <label for="til" style="font-size: 14px; margin: 4px">-</label>
            <Calendar
              id="til"
              v-model="til"
              dateFormat="dd.mm.yy"
              style="width: 135px"
              :showIcon="true"
            />
            <Checkbox
              id="aggrSett"
              v-model="aggrSett"
              :binary="true"
              style="margin-bottom: 5px; margin-left: 20px"
              v-on:change="updateDownloads()"
            />
            <label
              for="aggrSett"
              class="p-checkbox-label"
              style="font-size: 14px; margin-right: 40px"
            >
              Aggregert på sett
            </label>
          </td>
        </tr>
      </table>
    </template>
    <template #empty> Ingen treff. </template>
    <template #loading> Henter nedlastinger, vent litt... </template>
    <Column
      v-for="col of valgteKolonner.filter((clm) => filterColumn(clm))"
      :key="col.field"
      :field="col.field"
      :header="col.header"
      sortable
    >
      <template #body="slotProps">
        <div v-html="highlightMatches(slotProps.data[col.field])" />
      </template>
    </Column>
  </DataTable>
</template>

<script>
import NedlastingService from "@/service/NedlastingService";
import AuthService from "@/service/AuthService";
import { FilterMatchMode } from "primevue/api";

const kolArkivnr = { field: "arkivnr", header: "Arkivnr" };
const kolFil = { field: "file", header: "Fil" };
const kolTittel = { field: "tittel1", header: "Tittel" };
const kolKomponist = { field: "komponist", header: "Komponist" };
const kolArrangor = { field: "arrangor", header: "Arrangør" };
const kolAntall = { field: "antall", header: "Antall" };

const minCols = [kolAntall, kolArkivnr, kolTittel, kolFil];

const allCols = [
  kolAntall,
  kolArkivnr,
  kolTittel,
  kolFil,
  kolKomponist,
  kolArrangor,
];

export default {
  name: "Nedlastinger",
  data() {
    return {
      numLogLines: 0,
      loading: true,
      nedlastinger: [],
      fra: null,
      til: null,
      valgteKolonner: minCols,
      valgteKolonnerBackup: minCols,
      visAlleKolonner: false,
      aggrSett: false,
      filters: null,
    };
  },
  created() {
    this.initFilters();
  },
  watch: {
    fra() {
      this.updateDownloads();
    },
    til() {
      this.updateDownloads();
    },
  },
  mounted() {
    AuthService.user().then((user) => {
      if (user === undefined) {
        this.$router.push({ name: "Login" });
      }
    });
    this.fra = "01.01." + new Date().getFullYear();
    this.til = "31.12." + new Date().getFullYear();
    this.updateDownloads();
    if (sessionStorage.search) {
      this.filters["global"].value = sessionStorage.search;
    }
  },
  methods: {
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      };
      sessionStorage.search = "";
    },
    updateDownloads() {
      this.loading = true;
      NedlastingService.fetchNedlastinger({
        fra: this.fra,
        til: this.til,
        aggrSett: this.aggrSett,
      }).then((data) => {
        this.nedlastinger = data;
        this.loading = false;
      });
    },
    parseLog() {
      NedlastingService.parseLog()
        .then((res) => {
          this.handleSuccess(res, "Logg er lest inn");
        })
        .catch((error) => this.handleError(error));
      setTimeout(() => {
        this.updateDownloads();
      }, 500);
    },
    handleSuccess(res, text) {
      this.numLogLines = res;
      this.$toast.add({
        severity: "success",
        summary: text,
        detail: "Logg med " + this.numLogLines + " linjer er lest inn.",
        life: 3000,
      });
    },
    handleError(error) {
      this.$toast.add({
        severity: "error",
        summary: "Feil",
        detail: error,
        life: 3000,
      });
    },
    highlightMatches(data) {
      let currentSearch = this.filters.global.value;
      if (currentSearch === null || currentSearch.length < 2) {
        return data;
      }
      sessionStorage.search = currentSearch;
      if (data.toString().toLowerCase().includes(currentSearch.toLowerCase())) {
        return data.replace(new RegExp(currentSearch, "ig"), "<mark>$&</mark>");
      } else {
        return data;
      }
    },
    onVisAlleKolonner() {
      if (this.visAlleKolonner) {
        this.valgteKolonnerBackup = this.valgteKolonner;
        this.valgteKolonner = allCols;
      } else {
        if (this.valgteKolonnerBackup) {
          this.valgteKolonner = this.valgteKolonnerBackup;
        } else {
          this.valgteKolonner = minCols;
        }
      }
      // endring av 'valgteKolonner' vil rendre tabellen på nytt, da må vi også kjøre highlightMatches på nytt
      setTimeout(() => {
        this.highlightMatches();
      }, 500);
    },
    filterColumn(column) {
      return !(column.field === "file" && this.aggrSett);
    },
  },
};
</script>

<style></style>
