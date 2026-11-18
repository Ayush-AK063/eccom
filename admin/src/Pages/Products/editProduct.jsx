import React from "react";
import ProductForm from "./ProductForm";

const EditProduct = ({ data }) => <ProductForm key={data?._id} data={data} />;

export default EditProduct;
