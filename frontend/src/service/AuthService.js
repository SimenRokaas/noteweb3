import Api from "@/service/Api";
import router from "@/router";

export default class AuthService {
  static login(data) {
    return Api()
      .post("/auth/login", data)
      .then((res) => {
        router.push({ name: "Noter" });
      })
      .catch((err) => {
        console.error(err);
        console.log("Feil under innlogging");
      });
  }

  static logout() {
    return Api()
      .get("/auth/logout")
      .then((res) => {
        console.log("Logget ut");
        router.push({ name: "Login" });
      })
      .catch((err) => {
        console.error(err);
        console.log("Feil under utlogging");
      });
  }

  static user() {
    return Api()
      .get("/auth/user")
      .then((res) => {
        return res.data.user;
      })
      .catch((err) => {
        console.error(err);
        console.log("Feil ved henting av bruker");
      });
  }
}
