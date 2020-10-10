<template>
  <div>
    <!-- closable=false fordi klikk vil sette prop koblet til parent, ikke lov i vue -->
    <Dialog
      :visible="erSynlig"
      :style="{ width: '600px' }"
      header="Velg kolonner"
      :modal="true"
      :closable="false"
    >
      <div class="p-grid p-fluid">
        <PickList
          v-model="picklistData"
          listStyle="height:342px"
          dataKey="field"
        >
          <template #sourceHeader> Tilgjengelig </template>
          <template #targetHeader> Valgt </template>
          <template #item="slotProps">
            <div>
              <div>{{ slotProps.item.header }}</div>
            </div>
          </template>
        </PickList>
      </div>

      <template #footer>
        <div>
          <Button
            label="Avbryt"
            icon="pi pi-times"
            @click="skjulKolonnevalgDialog"
            class="p-button-warning"
            autofocus
          />
          <Button
            label="OK"
            icon="pi pi-check"
            @click="oppdaterKolonneValg"
            class="p-button-success"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
export default {
  name: "KolonnePicklist",
  props: ["erSynlig", "alleKolonner", "initieltValgteKolonner"],
  data() {
    return {
      picklistData: null,
      valgteKolonnerMedFlagg: [],
      venstreListe: [],
      hoyreListe: [],
      valgteKolonner: [],
    };
  },
  mounted() {
    const tilgjengelige = this.alleKolonner.filter(
      (a) => !this.initieltValgteKolonner.some((b) => a.field === b.field)
    );
    this.picklistData = [tilgjengelige, this.initieltValgteKolonner];
  },
  methods: {
    oppdaterKolonneValg() {
      this.$emit("valgte-kolonner", this.picklistData[1]);
      this.skjulKolonnevalgDialog();
    },
    skjulKolonnevalgDialog() {
      this.$emit("skjul-kolonnevalg");
    },
  },
};
</script>
