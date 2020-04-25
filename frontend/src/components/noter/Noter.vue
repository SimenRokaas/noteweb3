<template>
  <div>
    <Message severity="success"
      >Notearkivet har {{ noter.length }} noter</Message
    >
    <DataTable
      ref="dt"
      class="p-datatable-noter"
      :value="noter"
      :filters="filters"
      :loading="loading"
      sort-field="arkivNr"
      :sort-order="-1"
      :rows="10"
      :row-hover="true"
      :paginator="true"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rows-per-page-options="[10, 25, 50]"
      current-page-report-template="Viser {first} til {last} av {totalRecords} noter"
      :resizable-columns="true"
      export-filename="noter"
      csv-separator=";"
    >
      <template #header>
        <table>
          <tr>
            <td style="float: left">TJK Notearkiv</td>
            <td>
              <i class="pi pi-search"></i>
              <InputText
                v-model="filters['global']"
                placeholder="Fritekst søk"
                size="50"
              />
            </td>
            <td>
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
      <Column field="arkivNr" header="Arkivnr" :sortable="true"></Column>
      <Column field="tittel1" header="Tittel" :sortable="true"> </Column>
      <Column field="tittel2" header="Tittel 2" :sortable="true"></Column>
      <Column
        field="soloInstrument"
        header="Solo-instr"
        :sortable="true"
      ></Column>
      <Column field="durata" header="Durata" :sortable="true"></Column>
      <Column field="kategori1" header="Kategori" :sortable="true"></Column>
      <Column field="kategori2" header="Kategori 2" :sortable="true"></Column>
      <Column field="kategori3" header="Kategori 3" :sortable="true"></Column>
      <Column field="kommentar" header="Kommentar" :sortable="true"></Column>
    </DataTable>
  </div>
</template>

<script>
import NoteService from "../../service/NoteService";

export default {
  name: "Noter",
  data() {
    return {
      filters: {},
      loading: true,
      noter: null
    };
  },
  mounted() {
    NoteService.fetchNoter().then(data => {
      this.noter = data.noter;
      this.loading = false;
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
