import CartProduct from "../models/CartProduct.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const VARIANT_FIELDS = [
  ["size", "size"],
  ["productRam", "RAM"],
  ["productWeight", "weight"],
];

const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

export const addToCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found", error: true, success: false });
    }

    // Product mein jis variant ke options hain, wo chunna zaroori hai aur valid hona chahiye
    const variant = {};
    for (const [field, label] of VARIANT_FIELDS) {
      const options = toArr(product[field]);
      const chosen = (req.body[field] || "").toString().trim();
      if (options.length > 0) {
        if (!chosen) {
          return res.status(400).json({ message: `Please select ${label}`, error: true, success: false });
        }
        if (!options.includes(chosen)) {
          return res.status(400).json({ message: `Invalid ${label}`, error: true, success: false });
        }
      }
      variant[field] = options.length > 0 ? chosen : "";
    }

    const checkItemCart = await CartProduct.findOne({ userId, productId, ...variant });

    if (checkItemCart) {
      return res.status(400).json({
        message: "Product already in cart",
        error: true,
        success: false,
      });
    }

    const cartItem = new CartProduct({
      quantity: 1,
      userId,
      productId,
      ...variant,
    });

    const save = await cartItem.save();

    await User.updateOne(
      { _id: userId },
      { $addToSet: { shopping_cart: productId } }
    );

    return res.status(201).json({
      data: save,
      message: "Product added to cart successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};

export const getCartItemsController = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItem = await CartProduct.find({ userId }).populate("productId");

    return res.status(200).json({
      cartItem,
      message: "Cart items fetched successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};

// PUT /api/cart/update-qty
// Body: { _id, quantity?, size?, productRam?, productWeight? }
// Cart page se quantity aur/ya variant (size / RAM / weight) badalna.
// Naya variant pehle se cart mein ho to dono item merge ho jaate hain.
export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Cart item ID is required", error: true, success: false });
    }

    const cartItem = await CartProduct.findOne({ _id, userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found", error: true, success: false });
    }

    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found", error: true, success: false });
    }

    // Quantity (na bheji ho to purani)
    let quantity = cartItem.quantity;
    if (req.body.quantity !== undefined) {
      quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be 1 or more", error: true, success: false });
      }
    }

    // Variant (jo field bheji hai wahi badlo, valid option hona chahiye)
    const variant = {};
    for (const [field, label] of VARIANT_FIELDS) {
      const options = toArr(product[field]);
      if (req.body[field] === undefined) {
        variant[field] = cartItem[field] || "";
        continue;
      }
      const chosen = String(req.body[field] || "").trim();
      if (options.length > 0 && !options.includes(chosen)) {
        return res.status(400).json({ message: `Invalid ${label}`, error: true, success: false });
      }
      variant[field] = options.length > 0 ? chosen : "";
    }

    const variantChanged = Object.keys(variant).some((f) => (cartItem[f] || "") !== variant[f]);

    // Same product + same naya variant wala doosra item?
    const duplicate = variantChanged
      ? await CartProduct.findOne({ userId, productId: cartItem.productId, ...variant, _id: { $ne: cartItem._id } })
      : null;

    const finalQty = duplicate ? duplicate.quantity + quantity : quantity;
    if (product.countInStock > 0 && finalQty > product.countInStock) {
      return res.status(400).json({
        message: `Only ${product.countInStock} items in stock`,
        error: true,
        success: false,
      });
    }

    if (duplicate) {
      duplicate.quantity = finalQty;
      await duplicate.save();
      await CartProduct.deleteOne({ _id: cartItem._id });
      return res.status(200).json({
        data: duplicate,
        message: "Same option already in cart, items merged",
        error: false,
        success: true,
      });
    }

    cartItem.quantity = quantity;
    Object.assign(cartItem, variant);
    await cartItem.save();

    return res.status(200).json({
      data: cartItem,
      message: "Cart item updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};

export const deleteCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Cart item ID is required",
        error: true,
        success: false,
      });
    }

    // Sirf apne cart ka item delete ho sake
    const deletedItem = await CartProduct.findOneAndDelete({ _id: id, userId });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    const stillInCart = await CartProduct.exists({ userId, productId: deletedItem.productId });
    if (!stillInCart) {
      await User.updateOne(
        { _id: userId },
        { $pull: { shopping_cart: deletedItem.productId } }
      );
    }

    return res.status(200).json({
      data: deletedItem,
      message: "Cart item removed successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};
