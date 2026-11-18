import { variantView } from "./utils/formatPrice";
import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import ProductDetails from "./Pages/ProductDetails";
import { createContext } from "react";
import toast, { Toaster } from "react-hot-toast";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Drawer from "@mui/material/Drawer";
import AddressPanel from "./components/AddressPanel";
import { useState } from "react";
import ProductZoom from "./components/ProductZoom";
import { IoClose } from "react-icons/io5";
import ProductDetailsComponent from "./components/ProductDetails";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyAddress from "./Pages/MyAddress";
import MyList from "./Pages/MyList";
import Compare from "./Pages/Compare";
import NotFound from "./Pages/NotFound";
import CompareTray from "./components/CompareTray";
import { CompareProvider } from "./context/CompareContext";
import Orders from "./Pages/Orders";
import OrderSuccess from "./Pages/Order/success";
import OrderFailed from "./Pages/Order/failed";
import BlogDetails from "./Pages/BlogDetails";
import BlogList from "./Pages/BlogList";
import InfoPage from "./Pages/InfoPage";
import CollectionPage from "./Pages/Collection";
import { getData, postData, putData, deleteData } from "./utils/api";
import { mergeSettings } from "./utils/storeSettings";

const MyContext = createContext();

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState(false);
  const [productData, setProductData] = useState(null);
  const [settings, setSettings] = useState(mergeSettings());
  // Lagaya hua coupon { code, discount, description } — cart + checkout share karte hain
  const [coupon, setCoupon] = useState(null);
  const applyCoupon = async (code, subTotal) => {
    const res = await postData("/api/coupon/apply", { code, subTotal });
    if (res?.error === false) { setCoupon(res.data); return { ok: true, message: res.message }; }
    return { ok: false, message: res?.message || "Could not apply coupon" };
  };

  // Store settings (Admin → Settings): naam, logo, contact, shipping, COD...
  useEffect(() => {
    getData("/api/settings").then((res) => { if (res?.error === false) setSettings(mergeSettings(res.data)); });
  }, []);
  // Tab title + favicon
  useEffect(() => {
    const g = settings.general;
    const title = g.tabTitle || [g.storeName, g.tagline].filter(Boolean).join(" – ");
    if (title) document.title = title;
    if (g.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = g.favicon;
    }
  }, [settings.general]);
  const [maxWidth, setMaxWidth] = useState("lg");
  const [fullWidth, setFullWidth] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);

  const [openCartPanel, setOpenCartPanel] = useState(false);
  const [catData, setCatData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);
  const [addressList, setAddressList] = useState([]);
  const [openAddressPanel, setOpenAddressPanel] = useState(false);
  const [editAddress, setEditAddress] = useState(null); // null = add mode

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal(false);
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");

    // 1) No token → user is NOT logged in
    if (!token) {
      setIsLogin(false);
      setUserData(null);
      return;
    }

    // 2) Token exists → validate with backend
    getData("/api/user/user-details", { withCredentials: true })
      .then((res) => {
        console.log("Auto-login:", res);

        if (res && res.error === false) {
          setUserData(res.user);  // backend sends: { user: {...} }
          setIsLogin(true);
        } else {
          localStorage.removeItem('accesstoken', res?.data?.accesstoken);
          localStorage.removeItem('refreshtoken', res?.data?.refreshtoken);
          setIsLogin(false);
        }
      })
      .catch((err) => {
        console.log("Auto-login failed:", err);
        setIsLogin(false);
        setUserData(null);
      })
  }, []);  // 🔥 run ONCE on startup

  // Category tree (root → children → children) for header nav, drawer and home slider
  useEffect(() => {
    getData("/api/category").then((res) => {
      if (res?.error === false && Array.isArray(res?.data)) {
        setCatData(res.data);
      }
    });
  }, []);

  const openAlertBox = (status, msg) => {
    if (status === "success") {
      toast.success(msg);
    }
    if (status === "error") {
      toast.error(msg);
    }
  };

  // ── Cart ──
  // Backend se latest cart lao (product populated). Deleted product wale items skip.
  const getCartItems = () => {
    return getData("/api/cart").then((res) => {
      if (res?.error === false) {
        // Variant wale item: price / MRP / stock / photo us variant ke (baaki code productId se padhta hai)
        setCartData((res?.cartItem || []).filter((item) => item?.productId).map((item) => {
          const v = variantView(item.productId, item);
          if (!v.variant) return item;
          const images = v.image ? [v.image, ...(item.productId.images || []).filter((x) => x !== v.image)] : item.productId.images;
          return { ...item, productId: { ...item.productId, price: v.price, oldprice: v.oldprice, countInStock: v.stock, images } };
        }));
      }
      return res;
    });
  };

  // ── My List (wishlist) ──
  const getMyListData = () => {
    return getData("/api/mylist").then((res) => {
      if (res?.error === false) {
        setMyListData(res?.data || []);
      }
      return res;
    });
  };

  // Product list mein hai to uska MyList item, warna undefined
  const getMyListItem = (productId) =>
    myListData.find((item) => String(item?.productId) === String(productId));

  const removeFromMyList = async (myListId) => {
    const res = await deleteData(`/api/mylist/remove/${myListId}`);
    if (res?.error === false) {
      openAlertBox("success", "Product removed from My List");
      await getMyListData();
    } else {
      openAlertBox("error", res?.message || "Could not remove item");
    }
    return res;
  };

  // Dil icon: list mein nahi → add, hai → remove
  const toggleMyList = async (product) => {
    if (!isLogin) {
      openAlertBox("error", "You are not logged in, please login first");
      return { error: true };
    }
    const existing = getMyListItem(product?._id);
    if (existing) return removeFromMyList(existing._id);

    const res = await postData("/api/mylist/add", { productId: product?._id });
    if (res?.error === false) {
      openAlertBox("success", res?.message || "Product added to My List");
      await getMyListData();
    } else {
      openAlertBox("error", res?.message || "Could not add to My List");
    }
    return res;
  };

  // ── Address ──
  const getAddresses = () => {
    if (!userData?._id) return Promise.resolve();
    return getData(`/api/address/${userData._id}`).then((res) => {
      if (res?.error === false) {
        setAddressList(res?.data || []);
      }
      return res;
    });
  };

  // addr = null → Add, addr = object → Edit
  const openAddressPanelFor = (addr = null) => {
    setEditAddress(addr);
    setOpenAddressPanel(true);
  };

  const closeAddressPanel = () => {
    setOpenAddressPanel(false);
  };

  useEffect(() => {
    if (isLogin && userData?._id) {
      getAddresses();
    } else if (!isLogin) {
      setAddressList([]);
      setOpenAddressPanel(false);
    }
  }, [isLogin, userData?._id]);

  // Login hote hi cart + my list lao, logout par khaali
  useEffect(() => {
    if (isLogin) {
      getCartItems();
      getMyListData();
    } else {
      setCartData([]);
      setMyListData([]);
    }
  }, [isLogin]);

  const addToCart = async (product, quantity = 1, variant = {}) => {
    if (!isLogin) {
      openAlertBox("error", "Please login to add items to cart");
      return { error: true };
    }
    const res = await postData("/api/cart/add", {
      productId: product?._id,
      options: variant,
    });
    if (res?.error === false) {
      // Backend 1 qty se add karta hai; zyada chahiye to turant update
      if (quantity > 1 && res?.data?._id) {
        await putData("/api/cart/update-qty", { _id: res.data._id, quantity });
      }
      openAlertBox("success", res?.message || "Added to cart");
      await getCartItems();
    } else {
      openAlertBox("error", res?.message || "Could not add to cart");
    }
    return res;
  };

  const removeCartItem = async (cartItemId) => {
    const res = await deleteData(`/api/cart/delete/${cartItemId}`);
    if (res?.error === false) {
      openAlertBox("success", res?.message || "Removed from cart");
      await getCartItems();
    } else {
      openAlertBox("error", res?.message || "Could not remove item");
    }
    return res;
  };

  // Cart page se koi option (Size / Colour / Storage…) badlo (same option pehle se ho to backend merge karta hai)
  const updateCartVariant = async (cartItemId, field, value) => {
    const res = await putData("/api/cart/update-qty", { _id: cartItemId, options: { [field]: value } });
    if (res?.error === false) {
      openAlertBox("success", res?.message || "Cart updated");
      await getCartItems();
    } else {
      openAlertBox("error", res?.message || "Could not update item");
    }
    return res;
  };

  // Qty 0 (ya kam) ho to item hi hata do
  const updateCartQty = async (cartItemId, quantity) => {
    if (quantity < 1) {
      return removeCartItem(cartItemId);
    }
    const res = await putData("/api/cart/update-qty", { _id: cartItemId, quantity });
    if (res?.error === false) {
      await getCartItems();
    } else {
      openAlertBox("error", res?.message || "Could not update quantity");
    }
    return res;
  };

  const values = {
    settings,
    coupon,
    setCoupon,
    applyCoupon,
    setOpenProductDetailsModal,
    setOpenCartPanel,
    toggleCartPanel,
    openCartPanel,
    openAlertBox,
    isLogin,
    setIsLogin,
    setUserData,
    userData,
    productData,
    setProductData,
    catData,
    setCatData,
    cartData,
    setCartData,
    getCartItems,
    addToCart,
    updateCartQty,
    updateCartVariant,
    removeCartItem,
    myListData,
    setMyListData,
    getMyListData,
    getMyListItem,
    toggleMyList,
    removeFromMyList,
    addressList,
    setAddressList,
    getAddresses,
    openAddressPanel,
    editAddress,
    openAddressPanelFor,
    closeAddressPanel
  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={values}>
        <CompareProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/productListing"
             
              element={<ProductListing />}
            />
            <Route
              path="/product/:id"
             
              element={<ProductDetails />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/verify" element={<Verify />} />
            <Route
              path="/forgot-password"
             
              element={<ForgotPassword />}
            />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/my-address" element={<MyAddress />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/my-orders" element={<Orders />} />
            <Route path="/order/success" element={<OrderSuccess />} />
            <Route path="/order/failed" element={<OrderFailed />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetails />} />
            <Route path="/page/:slug" element={<InfoPage />} />
            <Route path="/collection/:slug" element={<CollectionPage />} />
            <Route path="/search" element={<ProductListing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        <Dialog
          open={openProductDetailsModal}
          fullWidth={fullWidth}
          maxWidth={maxWidth}
          onClose={handleCloseProductDetailsModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="productDetailModal"
        >
          <DialogContent>
            <div className="relative flex items-center w-full productDetailModalContainer">
              <Button
                className="!w-[40px] !min-w-[40px] !h-[40px] !rounded-full !text-[#000] !font-bold
              !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
                onClick={handleCloseProductDetailsModal}
              >
                <IoClose className="text-[20px]" />
              </Button>
              <div className="col1 w-[40%] px-3">
                <ProductZoom item={productData} />
              </div>
              <div className="col2 w-[60%] px-8 pr-16 py-8 productContent">
                <ProductDetailsComponent item={productData} compact />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Common address panel (My Address + Checkout) */}
        <Drawer open={openAddressPanel} onClose={closeAddressPanel} anchor="right" className="addressPanel">
          <AddressPanel />
        </Drawer>
        <CompareTray />
        </CompareProvider>
        </MyContext.Provider>
      </BrowserRouter>

      <Toaster />

    </>
  );
}

export default App;

export { MyContext };
