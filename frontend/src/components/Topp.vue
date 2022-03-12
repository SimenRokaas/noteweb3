<template>
  <div>
    <Toast position="top-left" />
    <table>
      <tr>
        <td style="vertical-align: middle">
          <!--suppress HtmlUnknownTarget -->
          <img
            src="Tønsberg-Janitsjarkorps-logo-600px-300x300.jpg"
            alt="TJK logo"
            width="50"
          />
        </td>
        <td style="vertical-align: middle">
          <span style="font-size: 18px; font-weight: bold">{{ tittel }}</span>
        </td>
        <td style="vertical-align: middle">
          <span style="font-size: 12px">v2022.03.13</span>
        </td>
        <td>
          <Varsel style="margin-left: 20px" />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import Varsel from "@/components/Varsel";

export default {
  name: "Topp",
  components: {
    Varsel,
  },
  data() {
    return {
      tittel: process.env.VUE_APP_TITLE,
    };
  },
};
</script>
