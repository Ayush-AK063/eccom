import MyList from "../models/MyList.js";
import Product from "../models/Product.js";

export const addToMyListController = async (req, res) => {
  try {
    // userId sirf login (auth) se — body se nahi
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required", success: false, error: true });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false, error: true });
    }

    const item = await MyList.findOne({ userId, productId });
    if (item) {
      return res.status(400).json({
        message: "Product already in My List",
        success: false,
        error: true,
      });
    }

    // Product data server khud DB se leta hai (client price/title nahi bhej sakta)
    const myList = new MyList({
      productId,
      userId,
      productTitle: product.name,
      image: product.images?.[0] || "",
      rating: product.rating || 0,
      price: product.price || 0,
      oldPrice: product.oldPrice || 0,
      discount: product.discount || 0,
      brand: product.brand || "",
    });

    const save = await myList.save();

    return res.status(201).json({
      message: "Product added to My List",
      success: true,
      error: false,
      data: save,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

export const deleteFromMyListController = async (req, res) => {
  try {
    const myListItem = await MyList.findById(req.params.id);

    // Sirf apna item delete kar sakte hain
    if (!myListItem || String(myListItem.userId) !== String(req.userId)) {
      return res.status(404).json({
        message: "Item not found in My List",
        success: false,
        error: true,
      });
    }

    const deletedItem = await MyList.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(500).json({
        message: "Failed to remove item from My List",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Item removed from My List",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

export const getMyListController = async (req, res) => {
  try {
    const userId = req.userId;
    const myListItems = await MyList.find({ userId });

    if (!myListItems) {
      return res.status(404).json({
        message: "No items found in My List",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "My List fetched successfully",
      success: true,
      error: false,
      data: myListItems,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
