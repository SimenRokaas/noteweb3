import Api from "@/service/Api";

export default class NoteService {
  static fetchNoter() {
    return Api()
      .get("/noter/list")
      .then((res) => res.data);
  }

  static update(note) {
    return Api()
      .put("/noter/" + note.ArkivNr, note)
      .then((res) => res);
  }

  static create(note) {
    return Api()
      .post("/noter", note)
      .then((res) => res);
  }

  static delete(note) {
    return Api()
      .delete("/noter/" + note.ArkivNr)
      .then((res) => res);
  }

  static getSkanListe(arkivnr) {
    return Api()
      .get("/noter/skanliste/" + arkivnr)
      .then((res) => res.data);
  }
}
