import React from "react";
import SlideForm from "./SlideForm";

const EditHomeSlide = ({ data }) => <SlideForm key={data?._id} data={data} />;

export default EditHomeSlide;
