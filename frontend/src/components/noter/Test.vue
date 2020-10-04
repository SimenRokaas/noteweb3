<template>
  <div>
    <DataTable :value="products">
      <template #header>
        <div style="text-align: left">
          <MultiSelect
            :modelValue="selectedColumns"
            :options="columns"
            optionLabel="header"
            @update:modelValue="onToggle"
            placeholder="Select Columns"
            style="width: 20em"
          />
        </div>
      </template>
      <Column field="code" header="Code" />
      <Column
        v-for="(col, index) of selectedColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field + '_' + index"
      ></Column>
    </DataTable>
  </div>
</template>

<script>
import ProductService from "@/service/ProductService";

export default {
  data() {
    return {
      selectedColumns: null,
      columns: null,
      products: null,
    };
  },
  productService: null,
  created() {
    this.productService = new ProductService();
    this.columns = [
      { field: "name", header: "Name" },
      { field: "category", header: "Category" },
      { field: "quantity", header: "Quantity" },
    ];
    this.selectedColumns = this.columns;
  },
  mounted() {
    this.products = ProductService.getProductsSmall();
  },
  methods: {
    onToggle(value) {
      this.selectedColumns = this.columns.filter((col) => value.includes(col));
    },
  },
};
</script>
