import Api from "@/service/Api";

export default class NedlastingService {
  static parseLog() {
    return Api()
      .get("/nedlastinger/parselog")
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }

  static fetchNedlastinger(params) {
    return Api()
      .get("/nedlastinger/list", {
        params: {
          fra: params.fra,
          til: params.til,
          aggrSett: params.aggrSett,
        },
      })
      .then((res) => res.data);
  }
}
