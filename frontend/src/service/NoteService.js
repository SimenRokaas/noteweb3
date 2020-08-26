import Api from "@/service/Api";

export default class NoteService {
  static fetchNoter() {
    return Api()
      .get("noter/list")
      .then(res => res.data.noter);
  }

  static update(note) {
    return Api()
      .put("/noter/" + note.arkivNr, note)
      .then(res => res);
  }

  static create(note) {
    return Api()
      .post("/noter", note)
      .then(res => res);
  }
}
