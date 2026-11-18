import axios from "axios";
import { refreshAccessToken, shouldRefresh } from "./session";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Admin ne account suspend kiya → token hatao, login page par message
const checkSuspended = (data) => {
  if (data?.suspended && localStorage.getItem("accesstoken")) {
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshtoken");
    window.location.href = "/login?suspended=1";
  }
};

export const postData = async (url, formData) => {
  try {
    // send POST request with fetch
    const send = (token) => fetch(`${apiUrl}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData), // convert JS object to JSON
    });
    let response = await send(localStorage.getItem("accesstoken"));
    // Token expire → refresh karke ek baar dobara
    if (shouldRefresh(response.status, url)) {
      const token = await refreshAccessToken();
      if (token) response = await send(token);
    }

    // Parse backend JSON response
    const data = await response.json();

    // Optional: handle non-success codes manually
    if (!response.ok) {
      console.error("Error Response:", data);
      checkSuspended(data);
      return { error: true, ...data };
    }

    return data; // Return parsed data to the caller
  } catch (error) {
    checkSuspended(error.response?.data);
    console.error("API Error:", error);
    return { error: true, message: error.message }; // rethrow for handling in your component
  }
};

export const getData = async (url) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.get(`${apiUrl}${url}`, params);

    return response.data;
  } catch (error) {
    checkSuspended(error.response?.data);
    console.error("GET Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};

export const putDataForImage = async (url, updatedData) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "multipart/form-data",
      },
    };
  
    const response = await axios.put(`${apiUrl}${url}`, updatedData, params)
  
    return response.data;
  } catch (error) {
    checkSuspended(error.response?.data);
    console.error("PUT Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

export const putData = async (url, updatedData) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "application/json",
      },
    };
  
    const response = await axios.put(`${apiUrl}${url}`, updatedData, params)
  
    return response.data;
  } catch (error) {
    checkSuspended(error.response?.data);
    console.error("PUT Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

export const deleteData = async (url) => {
  try {
    const params = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.delete(`${apiUrl}${url}`, params);

    return response.data;
  } catch (error) {
    checkSuspended(error.response?.data);
    console.error("DELETE Error:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};
