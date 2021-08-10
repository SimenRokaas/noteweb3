import axios from "axios";

export default () => {
  const apiUrl =
    process.env.VUE_APP_LOCAL_SERVER === "true"
      ? "http://localhost:57462"
      : "https://server.tjk.no/noter/";

  return axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });
};
