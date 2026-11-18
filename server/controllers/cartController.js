import { logActivity } from "../utils/activity.js";
import CartProduct from "../models/CartProduct.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

import { findVariant, hasVariantMatrix, maxQtyFor, selectionFromBody, selectionOf, validateSelection, legacyFields, sameSelection } from "../utils/variants.js";

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

    // Har option group ka value chuna hona chahiye aur valid
    const sel = selectionFromBody(req.body, product);
    const bad = validateSelection(product, sel);
    if (bad) return res.status(400).json({ message: bad, error: true, success: false });

    // Variant matrix ho to ye combination exist kare aur stock ho
    if (hasVariantMatrix(product) && !findVariant(product, sel)) {
      return res.status(400).json({ message: "This combination is not available", error: true, success: false });
    }
    if (maxQtyFor(product, sel) < 1) {
      return res.status(400).json({ message: "This option is out of stock", error: true, success: false });
    }

    const mine = await CartProduct.find({ userId, productId });
    const checkItemCart = mine.find((c) => sameSelection(selectionOf(c, product), sel));
    if (checkItemCart) {
      return res.status(400).json({ message: "Product already in cart", error: true, success: false });
    }
    const variant = { ...legacyFields(sel), options: sel };

    const cartItem = new CartProduct({
      quantity: 1,
      userId,
      productId,
      ...variant,
    });

    const save = await cartItem.save();
    logActivity(userId, "cart_add", { productId, name: product.name, options: sel }, req);

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

    // Option badalna: body.options (poora/aadha) ya purana single field (size / productRam …)
    const current = selectionOf(cartItem, product);
    const incoming = selectionFromBody({ ...req.body, options: { ...current, ...(req.body.options || {}) } }, product);
    // Body mein na aaya group → purana value
    const sel = {};
    for (const k of Object.keys(incoming)) sel[k] = incoming[k] || current[k] || "";
    const bad = validateSelection(product, sel);
    if (bad) return res.status(400).json({ message: bad, error: true, success: false });

    const variantChanged = !sameSelection(current, sel);
    const others = variantChanged ? await CartProduct.find({ userId, productId: cartItem.productId, _id: { $ne: cartItem._id } }) : [];
    const duplicate = others.find((c) => sameSelection(selectionOf(c, product), sel)) || null;

    if (hasVariantMatrix(product) && !findVariant(product, sel)) {
      return res.status(400).json({ message: "This combination is not available", error: true, success: false });
    }
    const finalQty = duplicate ? duplicate.quantity + quantity : quantity;
    const maxQty = maxQtyFor(product, sel);
    if (finalQty > maxQty) {
      const limited = product.maxOrderQty > 0 && maxQty === product.maxOrderQty;
      return res.status(400).json({
        message: maxQty < 1 ? "This option is out of stock" : limited ? `Max ${maxQty} per order` : `Only ${maxQty} items in stock`,
        error: true,
        success: false,
      });
    }
    const variant = { ...legacyFields(sel), options: sel };

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
    cartItem.markModified("options");
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
