import React, { useState } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import "./App.css";
import Dashboard from "./Pages/Dashboard";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import { createContext } from "react";
import Login from "./Pages/Login";
import Products from "./Pages/Products";
import AddProduct from "./Pages/Products/addProduct";
import EditProduct from "./Pages/Products/editProduct";
import ViewProduct from "./Pages/Products/viewProduct";
import AddProductRam from "./Pages/Products/addProductRam";
import AddProductWeight from "./Pages/Products/addProductWeight";
import AddProductSize from "./Pages/Products/addProductSize";
import toast, { Toaster } from "react-hot-toast";

import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { IoClose } from "react-icons/io5";
import Slide from "@mui/material/Slide";
import HomeSliderBanner from "./Pages/HomeSliderBanners";
import AddHomeSlide from "./Pages/HomeSliderBanners/addHomeSlide";
import EditHomeSlide from "./Pages/HomeSliderBanners/editHomeSlide";
import ViewHomeSlide from "./Pages/HomeSliderBanners/viewHomeSlide";
import BlogList from "./Pages/Blog";
import BlogForm from "./Pages/Blog/blogForm";
import CategoryList from "./Pages/Category";
import AddCategory from "./Pages/Category/addCategory";
import SubCatList from "./Pages/Category/subCatList";
import AddSubCategory from "./Pages/Category/addSubCategory";
import EditCategory from "./Pages/Category/editCategory";
import ViewCategory from "./Pages/Category/viewCategory";
import EditSubCategory from "./Pages/Category/editSubCategory";
import AddThirdCategory from "./Pages/Category/addThirdCategory";
import ThirdCatList from "./Pages/Category/thirdCatList";
import Users from "./Pages/Users";
import Orders from "./Pages/Orders";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyAccount from "./Pages/VerifyAccount";
import ChangePassword from "./Pages/ChangePassword";
import MyAccount from "./Pages/MyAccount";
import { useEffect } from "react";
import { getData } from "./utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MyContext = createContext();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);

  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = useState({
    open: false,
    model: "",
    data: null,
  });

  const [refetchHomeSlides, setRefetchHomeSlides] = useState(false);
  const [refetchBlogs, setRefetchBlogs] = useState(false);
  // Login check (user-details API) pura hone tak protected pages mat dikhao
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");

    // 1) No token → user is NOT logged in
    if (!token) {
      setIsLogin(false);
      setUserData(null);
      setAuthChecked(true);
      return;
    }

    // 2) Token exists → validate with backend
    getData("/api/user/user-details", { withCredentials: true })
      .then((res) => {
        console.log("Auto-login:", res);

        if (res && res.error === false && res.user?.role === "admin") {
          setUserData(res.user); // backend sends: { user: {...} }
          setIsLogin(true);
        } else if (res && res.error === false) {
          // Token valid hai par user admin nahi
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshtoken");
          setIsLogin(false);
          setUserData(null);
          toast.error("Admin access only");
        } else {
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshtoken");
          setIsLogin(false);
          setUserData(null);
          toast.error("Session expired. Please login again.");
        }
      })
      .catch((err) => {
        console.log("Auto-login failed:", err);
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        setIsLogin(false);
        setUserData(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);  // 🔥 run ONCE on startup

  const openAlertBox = (status, msg) => {
    if (status === "success") {
      toast.success(msg);
    }
    if (status === "error") {
      toast.error(msg);
    }
  };

  // Logout: API fail ho (token expire) tab bhi local session hamesha saaf karo
  const logout = () => {
    getData(`/api/user/logout?token=${localStorage.getItem("accesstoken")}`, { withCredentials: true })
      .finally(() => {
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        setUserData(null);
        setIsLogin(false);
        toast.success("Logged out");
      });
  };

  // Bina admin login ke andar ka koi page nahi
  const protect = (element) => {
    if (!authChecked) {
      return (
        <div className="flex items-center justify-center w-full h-screen">
          <CircularProgress />
        </div>
      );
    }
    return isLogin ? element : <Navigate to="/login" replace />;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <Dashboard />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/login",
      element: authChecked && isLogin ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: "/forgotpassword",
      element: (
        <>
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/verify-account",
      element: (
        <>
          <VerifyAccount />
        </>
      ),
    },
    {
      path: "/change-password",
      element: (
        <>
          <ChangePassword />
        </>
      ),
    },
    {
      path: "/products",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <Products />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/homeSlider/list",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <HomeSliderBanner />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/blog/list",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <BlogList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/category/list",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <CategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/subCategory/list",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <SubCatList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/thirdCategory/list",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <ThirdCatList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/users",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <Users />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/orders",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <Orders />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/my-account",
      element: protect(
        <>
          <section className="main">
            <Header />
            <div className="containerMain flex">
              <div
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? "w-[20%]" : "w-[0%] opacity-0"
                  } transition-all`}
              >
                <Sidebar />
              </div>
              <div
                className={`contentRight py-4 px-5 ${isSidebarOpen === true ? "w-[80%]" : "w-[100%]"
                  } transition-all`}
              >
                <MyAccount />
              </div>
            </div>
          </section>
        </>
      ),
    },
  ]);

  const values = {
    isSidebarOpen,
    setIsSidebarOpen,
    isLogin,
    setIsLogin,
    isOpenFullScreenPanel,
    setIsOpenFullScreenPanel,
    openAlertBox,
    userData,
    setUserData,
    refetchHomeSlides,
    setRefetchHomeSlides,
    refetchBlogs,
    setRefetchBlogs,
    logout,
  };

  return (
    <>
      <MyContext.Provider value={values}>
        <RouterProvider router={router} />

        <Dialog
          fullScreen
          open={isOpenFullScreenPanel.open}
          onClose={() =>
            setIsOpenFullScreenPanel({
              open: false,
            })
          }
          slots={{
            transition: Transition,
          }}
        >
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() =>
                  setIsOpenFullScreenPanel({
                    open: false,
                  })
                }
                aria-label="close"
              >
                <IoClose />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {isOpenFullScreenPanel?.model}
              </Typography>
            </Toolbar>
          </AppBar>

          {isOpenFullScreenPanel?.model === "Add Product" && <AddProduct />}

          {isOpenFullScreenPanel?.model === "Add Product RAM" && <AddProductRam />}

          {isOpenFullScreenPanel?.model === "Add Product Weight" && <AddProductWeight />}

          {isOpenFullScreenPanel?.model === "Add Product Size" && <AddProductSize />}

          {isOpenFullScreenPanel?.model === "Edit Product" && <EditProduct data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "View Product" && <ViewProduct data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "Add Home Slide" && <AddHomeSlide />}

          {isOpenFullScreenPanel?.model === "Edit Home Slide" && <EditHomeSlide data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "View Home Slide" && <ViewHomeSlide data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "Add Blog" && <BlogForm />}

          {isOpenFullScreenPanel?.model === "Edit Blog" && <BlogForm data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "Add New Category" && <AddCategory />}

          {isOpenFullScreenPanel?.model === "Add New Sub Category" && <AddSubCategory />}

          {isOpenFullScreenPanel?.model === "Add Third Level Category" && <AddThirdCategory />}

          {isOpenFullScreenPanel?.model === "Edit Category" && <EditCategory data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "Edit Sub Category" && <EditSubCategory data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "Edit Third Category" && <EditSubCategory data={isOpenFullScreenPanel?.data} />}

          {isOpenFullScreenPanel?.model === "View Category" && <ViewCategory data={isOpenFullScreenPanel?.data} />}
        </Dialog>
      </MyContext.Provider>

      <Toaster />
    </>
  );
}

export default App;
export { MyContext }; // Export the context for use in other components
