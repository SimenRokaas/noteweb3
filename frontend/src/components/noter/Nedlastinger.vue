<template>
  <h3>Nedlastinger</h3>
  <Button
    icon="pi pi-arrow-circle-left"
    label="Tilbake"
    @click="$router.back()"
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
              style="margin-bottom: 5px; margin-left: 4px"
              v-on:change="onVisAlleKolonner()"
            />
            <label
              for="alleKolonner"
              class="p-checkbox-label"
              style="font-size: 14px; margin-right: 4px"
            >
              Vis/søk i alle kolonner
            </label>
          </td>
        </tr>
      </table>
    </template>
    <template #empty> Ingen treff. </template>
    <template #loading> Henter nedlastinger, vent litt... </template>
    <Column
      v-for="col of valgteKolonner"
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
const kolTittel = { field: "tittel1", header: "Tittel" };
const kolKomponist = { field: "komponist", header: "Komponist" };
const kolArrangor = { field: "arrangor", header: "Arrangør" };
const kolTid = { field: "time", header: "Tid" };

const minCols = [kolArkivnr, kolTittel, kolTid];

const allCols = [kolArkivnr, kolTittel, kolKomponist, kolArrangor, kolTid];

export default {
  name: "Nedlastinger",
  data() {
    return {
      numLogLines: 0,
      loading: true,
      nedlastinger: [],
      valgteKolonner: minCols,
      valgteKolonnerBackup: minCols,
      visAlleKolonner: false,
      filters: null,
    };
  },
  created() {
    this.initFilters();
  },
  mounted() {
    AuthService.user().then((user) => {
      if (user === undefined) {
        this.$router.push({ name: "Login" });
      }
    });
    NedlastingService.fetchNedlastinger().then((data) => {
      this.nedlastinger = data;
      this.loading = false;
    });
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
    parseLog() {
      NedlastingService.parseLog()
        .then((res) => this.handleSuccess(res, "Logg er lest inn"))
        .catch((error) => this.handleError(error));
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
  },
};
</script>

<style></style>
