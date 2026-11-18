import axios from "axios";
import { refreshAccessToken, shouldRefresh } from "./session";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const postData = async (url, formData, options = {}) => {
  try {
    const { withCredentials, ...restOptions } = options;

    const isFormData = formData instanceof FormData;

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      ...restOptions.headers,
    };

    // If we're NOT sending FormData, set Content-Type to JSON
    // If we ARE sending FormData, we MUST let the browser set the Content-Type automatically (it adds the multipart boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const fetchOptions = {
      method: "POST",
      headers,
      body: isFormData ? formData : JSON.stringify(formData),
      ...restOptions,
    };

    if (withCredentials) {
      fetchOptions.credentials = "include";
    }

    let response = await fetch(`${apiUrl}${url}`, fetchOptions);
    // Token expire → refresh karke ek baar dobara
    if (shouldRefresh(response.status, url)) {
      const token = await refreshAccessToken();
      if (token) response = await fetch(`${apiUrl}${url}`, { ...fetchOptions, headers: { ...headers, Authorization: `Bearer ${token}` } });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Error Response:", data);
      return { error: true, ...data };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { error: true, message: error.message };
  }
};

export const getData = async (url, options = {}) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };
    const response = await axios.get(`${apiUrl}${url}`, params);

    return response.data;
  } catch (error) {
    console.error("GET Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};

export const putData = async (url, formData, options = {}) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };
    const response = await axios.put(`${apiUrl}${url}`, formData, params);
    return response.data;
  } catch (error) {
    console.error("PUT Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};

export const putDataForImage = async (url, formData, options = {}) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "multipart/form-data",
        ...options.headers,
      },
      ...options,
    };
    const response = await axios.put(`${apiUrl}${url}`, formData, params);
    return response.data;
  } catch (error) {
    console.error("PUT Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};

export const deleteData = async (url, options = {}) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };
    const response = await axios.delete(`${apiUrl}${url}`, params);

    return response.data;
  } catch (error) {
    console.error("DELETE Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};