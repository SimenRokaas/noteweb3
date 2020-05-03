<template>
  <DataTable
    ref="dt"
    class="p-datatable-noter"
    :value="noter"
    :filters="filters"
    :loading="loading"
    auto-layout
    sort-field="arkivNr"
    :sort-order="-1"
    :rows="15"
    :rows-per-page-options="[15, 30, 60, 100]"
    :row-hover="true"
    :paginator="true"
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    current-page-report-template="Viser {first} til {last} av {totalRecords} noter"
    :resizable-columns="true"
    export-filename="noter"
    csv-separator=";"
  >
    <template #header>
      <table>
        <tr>
          <td style="float: left; margin-right: 8px">
            TJK Notearkiv
          </td>
          <td style="float: left">
            <i class="pi pi-search"></i>
            <InputText
              v-model="filters['global']"
              placeholder="Fritekst søk"
              size="50"
            />
          </td>
          <td style="float: right;">
            <Checkbox
              id="kanSkrive"
              v-model="kanSkrive"
              :binary="true"
              :disabled="true"
            />
            <label
              for="kanSkrive"
              class="p-checkbox-label"
              style="font-size: 14px; margin-right: 4px"
            >
              Kan skrive
            </label>
            <Checkbox id="showAllCols" v-model="showAllCols" :binary="true" />
            <label
              for="showAllCols"
              class="p-checkbox-label"
              style="font-size: 14px; margin-right: 4px"
            >
              Vis alle kolonner
            </label>
            <Button
              style="float: right"
              icon="pi pi-external-link"
              label="Eksport"
              @click="exportCSV($event)"
            />
          </td>
        </tr>
      </table>
    </template>
    <template #empty>
      Ingen treff.
    </template>
    <template #loading>
      Laster noter, vent litt...
    </template>
    <Column field="arkivNr" header="Arkivnr" :sortable="true" />
    <Column
      v-for="col of columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
      :sortable="true"
    />
  </DataTable>
</template>

<script>
import NoteService from "@/service/NoteService";
import RolleService from "@/service/RolleService";

const kolTittel1 = { field: "tittel1", header: "Tittel" };
const kolTittel2 = { field: "tittel2", header: "Tittel 2" };
const kolSolo = { field: "soloInstrument", header: "Solo-instr" };
const kolDurata = { field: "durata", header: "Durata" };
const kolKategori1 = { field: "kategori1", header: "Kategori" };
const kolKategori2 = { field: "kategori2", header: "Kategori 2" };
const kolKategori3 = { field: "kategori3", header: "Kategori 3" };
const kolKommentar = { field: "kommentar", header: "Kommentar" };

const allCols = [
  kolTittel1,
  kolTittel2,
  kolSolo,
  kolDurata,
  kolKategori1,
  kolKategori2,
  kolKategori3,
  kolKommentar
];
const minCols = [kolTittel1, kolKategori1, kolKommentar];

export default {
  name: "Noter",
  data() {
    return {
      columnOptions: null,
      showAllCols: false,
      filters: {},
      loading: true,
      noter: [],
      kanSkrive: false
    };
  },
  computed: {
    columns() {
      return this.showAllCols ? allCols : minCols;
    }
  },
  created() {
    this.columnOptions = this.showAllCols ? allCols : minCols;
  },
  mounted() {
    NoteService.fetchNoter().then(data => {
      this.noter = data;
      this.loading = false;
    });
    // hvis vi kan nå en styre-side på tjk.no så har vi skrive-rettighet
    RolleService.fetchRolle().then(data => {
      this.kanSkrive = data;
    });
  },
  methods: {
    exportCSV() {
      this.$refs.dt.exportCSV();
    }
  }
};
</script>

<style>
.p-dropdown {
  float: left;
}

.p-paginator-current {
  float: right;
}

.p-datatable-header {
  border: 0 none;
  padding: 12px;
  text-align: left;
  font-size: 20px;
}
</style>
