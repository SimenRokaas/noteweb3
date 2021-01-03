import Api from "@/service/Api";
import router from "@/router";

export default class AuthService {
  static login(data) {
    return Api()
      .post("/auth/login", data)
      .then(() => {
        router.push({ name: "Noter" });
      })
      .catch((err) => {
        throw err;
      });
  }

  static logout() {
    return Api()
      .get("/auth/logout")
      .then(() => {
        router.push({ name: "Login" });
      })
      .catch((err) => {
        console.error(err);
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
        router.push({ name: "Login" });
      });
  }
}
