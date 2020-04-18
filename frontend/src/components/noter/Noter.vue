<template>
  <DataTable :value="noter">
    <Column field="id" header="ID"></Column>
    <Column field="year" header="Year"></Column>
    <Column field="tittel" header="Tittel"></Column>
    <Column field="color" header="Color"></Column>
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
      noter: null
    };
  },
  noteService: null,
  created() {
    this.noteService = new NoteService();
  },
  mounted() {
    //this.noteService.fetchNoter().then(data => this.noter = data);
    this.noter = this.noteService.fetchNoter();
  }
};
</script>
