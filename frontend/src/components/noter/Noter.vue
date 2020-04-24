<template>
  <DataTable :value="noter">
    <Column field="arkivNr" header="Arkivnr"></Column>
    <Column field="tittel1" header="Tittel"></Column>
    <Column field="tittel2" header="Tittel 2"></Column>
    <Column field="soloInstrument" header="Solo-instrument"></Column>
    <Column field="durata" header="Durata"></Column>
    <Column field="kategori1" header="Kategori"></Column>
    <Column field="kategori2" header="Kategori 2"></Column>
    <Column field="kategori3" header="Kategori 3"></Column>
    <Column field="kommentar" header="Kommentar"></Column>
  </DataTable>
</template>

<script>
import NoteService from "../../service/NoteService";

import DataTable from "primevue/datatable";
import Column from "primevue/column";

export default {
  name: "Noter",
  components: {
    DataTable,
    Column
  },
  data() {
    return {
      noter: []
    };
  },
  mounted() {
    NoteService.fetchNoter().then(data => {
      console.log(data.noter[0]);
      this.noter = data.noter;
    });
  }
};
</script>
