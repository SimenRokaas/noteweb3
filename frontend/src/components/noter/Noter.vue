<template>
  <div>
    <DataTable
      :filters="filters"
      :loading="loading"
      :paginator="true"
      :resizable-columns="true"
      :reorderableColumns="true"
      :row-hover="true"
      :rows="15"
      :rows-per-page-options="[15, 30, 60, 100]"
      :selection.sync="valgtNote"
      :sort-order="-1"
      :value="noter"
      auto-layout
      class="p-datatable-striped"
      csv-separator="|"
      current-page-report-template="Viser {first} til {last} av {totalRecords} noter"
      dataKey="ArkivNr"
      export-filename="noter"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      ref="dt"
      id="notetabell"
      selection-mode="single"
      sort-field="kolArkivNr"
      v-if="kanLese || kanSkrive"
    >
      <template #header>
        <table>
          <tr>
            <td style="float: left">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <InputText
                  v-model="filters['global']"
                  placeholder="Fritekst søk"
                  size="40"
                  @keyup="highlightMatches()"
                />
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
              </span>
            </td>
            <td style="float: right">
              <span v-if="erDev">
                <Checkbox
                  id="toggleKanLese"
                  v-model="kanLese"
                  :binary="true"
                  style="margin-bottom: 5px; margin-right: 4px"
                />
                <label
                  for="toggleKanLese"
                  class="p-checkbox-label"
                  style="font-size: 9px; margin-right: 4px"
                >
                  Kan lese (DEV)
                </label>
              </span>
              <span v-if="erDev">
                <Checkbox
                  id="toggleKanSkrive"
                  v-model="kanSkrive"
                  :binary="true"
                  style="margin-bottom: 5px; margin-right: 4px"
                />
                <label
                  for="toggleKanSkrive"
                  class="p-checkbox-label"
                  style="font-size: 9px; margin-right: 4px"
                >
                  Kan skrive (DEV)
                </label>
              </span>
              <Checkbox
                id="visProsjekt"
                v-model="visProsjekt"
                :binary="true"
                style="margin-bottom: 5px; margin-right: 4px"
              />
              <label
                for="visProsjekt"
                class="p-checkbox-label"
                style="font-size: 14px; margin-right: 4px"
              >
                Vis prosjekt
              </label>
              <Button
                icon="pi pi-arrow-circle-down"
                label="Vis nedlastinger"
                @click="$router.push({ name: 'Nedlastinger' })"
                style="margin-right: 4px"
                class="p-button-warning"
              />
              <Button
                icon="pi pi-cog"
                label="Velg kolonner"
                @click="visKolonneValgDialog = true"
                style="margin-right: 4px"
                class="p-button-help"
              />
              <Button
                icon="pi pi-plus"
                label="Legg til"
                @click="leggTilNote"
                style="margin-right: 4px"
                v-show="kanSkrive"
                class="p-button-success"
              />
              <SplitButton
                label="Eksport"
                icon="pi pi-external-link"
                :model="eksportValg"
                style="margin-right: 4px"
              >
              </SplitButton>
              <Button
                icon="pi pi-sign-out"
                label="Logg ut"
                @click="loggUt"
                class="p-button-danger"
              ></Button>
            </td>
          </tr>
        </table>
      </template>
      <template #empty> Ingen treff. </template>
      <template #loading> Laster noter, vent litt... </template>

      <Column :exportable="false">
        <template #body="slotProps">
          <Button
            :icon="kanSkrive ? 'pi pi-pencil' : 'pi pi-search'"
            class="p-button-success"
            style="margin-right: 4px"
            @click="onRowSelect(slotProps.data)"
          />
          <Button
            icon="pi pi-print"
            class="p-button-warning"
            @click="visNoteskannDialog(slotProps.data)"
          />
        </template>
      </Column>
      <Column
        v-if="visProsjekt"
        key="Prosjekt"
        field="Prosjekt"
        header="Prosjekt"
        sortable
      />
      <Column
        v-for="col of valgteKolonner.filter((clm) => clm.field !== 'Prosjekt')"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        sortable
      />
    </DataTable>

    <KolonnePicklist
      :erSynlig="visKolonneValgDialog"
      :alleKolonner="allColumns"
      :initieltValgteKolonner="valgteKolonner"
      @skjul-kolonnevalg="skjulKolonneValgDialog"
      @valgte-kolonner="oppdaterValgteKolonner"
    />

    <NoteDialog
      :erSynlig="visDialog"
      :mode="mode"
      :dialogNote="dialogNote"
      :arkNrNaa="arkNrNaa"
      :noter="noter"
      :valgtNote="valgtNote"
      :kanSkrive="kanSkrive"
      :allColumns="allColumns"
      :visAvbrytKnapp="visAvbrytKnapp"
      :visSlettKnapp="visSlettKnapp"
      @skjul-notedialog="skjulNoteDialog"
    />

    <NoteskannLenkerDialog
      :erSynlig="visNoteskannLenkerDialog"
      :arkivNr="arkNrNaa"
      :lenker="skannedeNoter"
      @skjul-noteskannlenkerdialog="skjulNoteskannLenkerDialog"
    />
  </div>
</template>

<script>
import AuthService from "@/service/AuthService";
import NoteService from "@/service/NoteService";
import KolonnePicklist from "@/components/noter/KolonnePicklist";
import NoteDialog from "@/components/noter/NoteDialog";
import NoteskannLenkerDialog from "@/components/noter/NoteskannLenkerDialog";
import XLSX from "xlsx";

const kolArkivNr = { field: "ArkivNr", header: "Arkivnr" };
const kolTittel1 = { field: "Tittel1", header: "Tittel" };
const kolTittel2 = { field: "Tittel2", header: "Tittel 2" };
const kolSolo = { field: "Soloinstrument", header: "Solo-instr" };
const kolDurata = { field: "Durata", header: "Durata" };
const kolKategori1 = { field: "Kategori1", header: "Kategori" };
const kolKategori2 = { field: "Kategori2", header: "Kategori 2" };
const kolKategori3 = { field: "Kategori3", header: "Kategori 3" };
const kolKommentar = { field: "Kommentar", header: "Kommentar" };
const kolKomponist = { field: "Komponist", header: "Komponist" };
const kolLand = { field: "Land", header: "Land" };
const kolArrangor = { field: "Arrangor", header: "Arrangør" };
const kolArrangertFor1 = { field: "ArrangertFor1", header: "Arrangert for" };
const kolArrangertFor2 = { field: "ArrangertFor2", header: "Arrangert for 2" };
const kolProsjekt = { field: "Prosjekt", header: "Prosjekt" };

const allCols = [
  kolArkivNr,
  kolTittel1,
  kolTittel2,
  kolSolo,
  kolDurata,
  kolKategori1,
  kolKategori2,
  kolKategori3,
  kolKommentar,
  kolKomponist,
  kolLand,
  kolArrangor,
  kolArrangertFor1,
  kolArrangertFor2,
  kolProsjekt,
];
const minCols = [
  kolProsjekt,
  kolArkivNr,
  kolTittel1,
  kolKomponist,
  kolArrangor,
  kolKommentar,
];

export default {
  name: "Noter",
  data() {
    return {
      allColumns: allCols,
      arkNrNaa: null,
      dialogNote: {},
      eksportValg: [
        {
          label: "Alle > Excel",
          title: "Eksporter alle noter til Excel-fil (faste kolonner)",
          icon: "pi pi-file-excel",
          command: () => {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(this.noter);
            ws["!cols"] = [
              { wch: 6 }, // arkivNr
              { wch: 20 }, // tittel1
              { wch: 15 }, // tittel2
              { wch: 10 }, // soloinstr
              { wch: 8 }, // durata
              { wch: 20 }, // kat1
              { wch: 20 }, // kat2
              { wch: 10 }, // kat3
              { wch: 30 }, // kommentar
              { wch: 20 }, // komponist
              { wch: 8 }, // land
              { wch: 20 }, // arrangor
              { wch: 10 }, // arrangortFor1
              { wch: 10 }, // arrangortFor2
              { wch: 10 }, // prosjekt
            ];
            XLSX.utils.book_append_sheet(wb, ws, "TJK-notearkiv-alle");
            XLSX.writeFile(wb, "TJK-notearkiv-alle.xlsx");
          },
        },
        {
          label: "Skjerm > Excel",
          title: "Eksporter vist tabell til Excel-fil",
          icon: "pi pi-file-excel",
          command: () => {
            const elt = document.getElementById("notetabell");
            const wb = XLSX.utils.table_to_book(elt, {
              sheet: "TJK-notearkiv-utsnitt",
            });
            XLSX.writeFile(wb, "TJK-notearkiv-utsnitt.xlsx");
          },
        },
        {
          label: "Skjerm > CSV",
          title: "Eksporter vist tabell til csv-fil, feltskille '|'",
          icon: "pi pi-file",
          command: () => {
            this.$refs.dt.exportCSV();
          },
        },
      ],
      erDev: process.env.NODE_ENV === "development",
      filters: {},
      visProsjekt: true,
      valgteKolonner: minCols,
      valgteKolonnerBackup: minCols,
      visAlleKolonner: false,
      kanLese: false,
      kanSkrive: false,
      loading: true,
      mode: "VIS",
      noter: [],
      passord: null,
      passordFeil: false,
      tittel: process.env.VUE_APP_TITLE,
      valgtNote: null,
      visAvbrytKnapp: false,
      visDialog: false,
      visKolonneValgDialog: false,
      visSlettKnapp: true,
      skannedeNoter: [],
      visNoteskannLenkerDialog: false,
    };
  },
  components: {
    KolonnePicklist,
    NoteDialog,
    NoteskannLenkerDialog,
  },
  mounted() {
    this.title = process.env.VUE_APP_TITLE;
    if (this.$route.query.search) {
      sessionStorage.search = this.$route.query.search;
    }
    AuthService.user().then((user) => {
      if (user === undefined) {
        this.$router.push({ name: "Login" });
        return;
      }
      if (user.rolle === "les") {
        this.kanLese = true;
        this.kanSkrive = false;
      }
      if (user.rolle === "skriv") {
        this.kanLese = true;
        this.kanSkrive = true;
      }
    });
    NoteService.fetchNoter().then((data) => {
      this.noter = data;
      this.loading = false;
    });
    if (sessionStorage.search) {
      this.filters["global"] = sessionStorage.search;
    }
  },
  methods: {
    onRowSelect(data) {
      this.arkNrNaa = data.ArkivNr;
      this.mode = "ENDRE";
      this.dialogNote = { ...data };
      this.visSlettKnapp = true;
      this.visAvbrytKnapp = true;
      this.visDialog = true;
    },
    highlightMatches() {
      let doReplace = true;
      if (this.filters.global === undefined) {
        this.filters["global"] = "";
      }
      sessionStorage.search = this.filters["global"];
      if (this.filters["global"] === "") {
        // bug når sida er lasta med search-param: inputfelt v-model kobles av. Nullstiller objekt for reset.
        this.filters = {};
        doReplace = false;
      }
      const searchWords = doReplace ? this.filters["global"].split(" ") : [];
      const tabellen = document.querySelector(".p-datatable-tbody");
      const tds = tabellen.getElementsByTagName("TD");
      tds.forEach((td) => {
        if (td.innerHTML.includes("<mark>")) {
          td.innerHTML = td.innerHTML.replace(/<mark>(.*)<\/mark>/, "$1");
        }
        searchWords.forEach((word) => {
          if (
            word.length > 0 &&
            td.textContent.toLowerCase().indexOf(word.toLowerCase()) !== -1
          ) {
            const wordEscaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            td.innerHTML = td.innerHTML.replace(
              new RegExp(wordEscaped, "i"),
              "<mark>$&</mark>"
            );
          }
        });
      });
    },
    leggTilNote() {
      this.mode = "NY";
      this.arkNrNaa = this.genererArkivnr();
      this.dialogNote = {
        ArkivNr: this.arkNrNaa,
      };
      this.visSlettKnapp = false;
      this.visAvbrytKnapp = true;
      this.visDialog = true;
    },
    genererArkivnr() {
      let currentMax = Math.max(...this.noter.map((n) => n.ArkivNr));
      return currentMax + 1;
    },
    skjulNoteDialog() {
      this.visDialog = false;
      this.dialogNote = null;
    },
    skjulKolonneValgDialog() {
      this.visKolonneValgDialog = false;
    },
    oppdaterValgteKolonner(kol) {
      this.valgteKolonner = kol;
    },
    loggUt() {
      sessionStorage.removeItem("search");
      AuthService.logout().then(() => {
        this.kanSkrive = false;
        this.kanLese = false;
      });
    },
    visNoteskannDialog(data) {
      this.arkNrNaa = data.ArkivNr;
      NoteService.getSkanListe(data.ArkivNr)
        .then((res) => (this.skannedeNoter = res))
        .catch((error) => this.handleError(error));
      this.visNoteskannLenkerDialog = true;
    },
    skjulNoteskannLenkerDialog() {
      this.visNoteskannLenkerDialog = false;
      this.skannedeNoter = [];
    },
    onVisAlleKolonner() {
      console.log("Flagg: " + this.visAlleKolonner);
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
