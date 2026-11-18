import Product from "../models/Product.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Variant fields (RAM / size / weight) hamesha saaf string array ho — "4GB" ya ["4GB","8GB"] dono chalega
const toVariantArr = (v) =>
  (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter((x) => x && x !== "null");

export const uploadImages = async (req, res) => {
  try {
    const uploadedImages = [];

    const image = req.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < req?.files?.length; i++) {
      // Use promise style, not callback
      const result = await cloudinary.uploader.upload(
        req?.files[i]?.path,
        options
      );
      uploadedImages.push(result.secure_url);
      fs.unlinkSync(`uploads/${req?.files[i]?.filename}`);
    }

    return res.status(200).json({
      images: uploadedImages,
      message: "Image uploaded successfully",
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const createProduct = async (req, res) => {
  try {
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: req.body.images || [],
      brand: req.body.brand || null,
      price: req.body.price || 0,
      oldprice: req.body.oldprice || 0,
      catName: req.body.catName || null,
      catId: req.body.catId || null,
      subCatId: req.body.subCatId || null,
      subCat: req.body.subCat || null,
      thirdSubCatId: req.body.thirdSubCatId || null,
      thirdSubCat: req.body.thirdSubCat || null,
      countInStock: req.body.countInStock || 0,
      rating: req.body.rating || 0,
      productFlags: req.body.productFlags || [],
      discount: req.body.discount,
      productRam: toVariantArr(req.body.productRam),
      size: toVariantArr(req.body.size),
      productWeight: toVariantArr(req.body.productWeight),
    });

    product = await product.save();

    if (!product) {
      return res
        .status(400)
        .json({ message: "Product not created", error: true, success: false });
    }

    return res.status(201).json({
      product,
      message: "Product created successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    // Build query object
    let query = {};
    if (req.query.category && req.query.category !== "") {
      query.catId = req.query.category;
    }
    if (req.query.subCategory && req.query.subCategory !== "") {
      query.subCatId = req.query.subCategory;
    }
    if (req.query.thirdCategory && req.query.thirdCategory !== "") {
      query.thirdSubCatId = req.query.thirdCategory;
    }
    if (req.query.search && req.query.search !== "") {
      query.name = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.flag && req.query.flag !== "") {
      query.productFlags = { $in: [req.query.flag] };
    }

    const totalPosts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find(query)
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductByCatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find({ catId: req.params.id })
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductByCatName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find({ catName: req.query.catName })
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductBySubCatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find({ subCatId: req.params.id })
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductBySubCatName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find({ subCat: req.query.subCat })
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductByThirdSubCatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find({ thirdSubCatId: req.params.id })
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductByThirdSubCatName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    const products = await Product.find({ thirdSubCat: req.query.thirdSubCat })
      .populate("catId")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductByPrice = async (req, res) => {
  try {
    let productList = [];

    if (req.query.catId !== "" && req.query.catId !== undefined) {
      const productListArr = await Product.find({
        catId: req.query.catId,
      }).populate("catId");

      productList = productListArr;
    }
    if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
      const productListArr = await Product.find({
        subCatId: req.query.subCatId,
      }).populate("catId");

      productList = productListArr;
    }
    if (
      req.query.thirdSubCatId !== "" &&
      req.query.thirdSubCatId !== undefined
    ) {
      const productListArr = await Product.find({
        thirdSubCatId: req.query.thirdSubCatId,
      }).populate("catId");

      productList = productListArr;
    }

    const filteredProducts = productList.filter((product) => {
      if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
        return false;
      }
      if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
        return false;
      }
      return true;
    });

    return res.status(200).json({
      products: filteredProducts,
      message: "Products fetched successfully",
      totalPages: 0,
      page: 0,
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductByRating = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    let products = [];

    if (req.query.catId !== undefined) {
      products = await Product.find({
        rating: req.query.rating,
        catId: req.query.catId,
      })
        .populate("catId")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (req.query.subCatId !== undefined) {
      products = await Product.find({
        rating: req.query.rating,
        subCatId: req.query.subCatId,
      })
        .populate("catId")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (req.query.thirdSubCatId !== undefined) {
      products = await Product.find({
        rating: req.query.rating,
        thirdSubCatId: req.query.thirdSubCatId,
      })
        .populate("catId")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      totalPages,
      page,
      message: "Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getProductCount = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();

    if (!productCount) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      productCount,
      message: "Product count fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getFeaturedProduct = async (req, res) => {
  try {
    const products = await Product.find({ productFlags: { $in: ["featured"] } }).populate("catId");

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", error: true, success: false });
    }

    return res.status(200).json({
      products,
      message: "Featured Products fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("catId");

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", error: true, success: false });
    }

    const images = product.images;

    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imagename = image.split(".")[0];

      if (imagename) {
        await cloudinary.uploader.destroy(imagename, function (error, result) {
          // console.log(result, error);
        });
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res
        .status(400)
        .json({ message: "Product not deleted", error: true, success: false });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("catId");

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", error: true, success: false });
    }

    return res.status(200).json({
      product,
      message: "Product fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteImageFromCloudinary = async (req, res) => {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
      const result = await cloudinary.uploader.destroy(
        imageName,
        function (error, result) {
          //console.log(result, error);
        }
      );

      if (result) {
        res.status(200).send(result);
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: req.body.images,
        brand: req.body.brand || null,
        price: req.body.price || 0,
        oldprice: req.body.oldprice || 0,
        catName: req.body.catName || null,
        catId: req.body.catId || null,
        subCatId: req.body.subCatId || null,
        subCat: req.body.subCat || null,
        thirdSubCatId: req.body.thirdSubCatId || null,
        thirdSubCat: req.body.thirdSubCat || null,
        countInStock: req.body.countInStock || 0,
        rating: req.body.rating || 0,
        productFlags: req.body.productFlags || [],
        discount: req.body.discount,
        productRam: toVariantArr(req.body.productRam),
        size: toVariantArr(req.body.size),
        productWeight: toVariantArr(req.body.productWeight),
      },
      { new: true }
    );

    if (!product) {
      return res
        .status(400)
        .json({ message: "Product not updated", error: true, success: false });
    }

    return res.status(200).json({
      product,
      message: "Product updated successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided", error: true, success: false });
    }

    const products = await Product.find({ _id: { $in: ids } });

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        for (const imgUrl of product.images) {
          const urlArr = imgUrl.split("/");
          const image = urlArr[urlArr.length - 1];
          const imagename = image.split(".")[0];
          if (imagename) {
            await cloudinary.uploader.destroy(imagename, function (error, result) { });
          }
        }
      }
    }

    await Product.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: "Products deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

// POST /api/product/filters
// Body: { catId:[], subCatId:[], thirdSubCatId:[], minPrice, maxPrice, rating:[], availability:[],
//         size:[], search, sortBy, order, page, limit }
export const filterProducts = async (req, res) => {
  try {
    const {
      catId = [],
      subCatId = [],
      thirdSubCatId = [],
      minPrice,
      maxPrice,
      rating = [],
      availability = [],
      size = [],
      search = "",
      sortBy = "",
      order = "asc",
      page = 1,
      limit = 12,
    } = req.body;

    const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
    const query = {};

    if (toArr(catId).length) query.catId = { $in: toArr(catId) };
    if (toArr(subCatId).length) query.subCatId = { $in: toArr(subCatId) };
    if (toArr(thirdSubCatId).length) query.thirdSubCatId = { $in: toArr(thirdSubCatId) };

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== "") query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    // Rating: [4] => 4 star aur usse upar (4 - 4.99) ; multiple select ho to OR
    const ratings = toArr(rating).map(Number).filter((r) => r >= 1 && r <= 5);
    if (ratings.length) {
      query.$or = ratings.map((r) => ({ rating: { $gte: r, $lt: r === 5 ? 5.01 : r + 1 } }));
    }

    // Availability: "inStock" / "outOfStock" (dono select = koi filter nahi)
    const avail = toArr(availability);
    if (avail.includes("inStock") && !avail.includes("outOfStock")) query.countInStock = { $gt: 0 };
    if (avail.includes("outOfStock") && !avail.includes("inStock")) query.countInStock = { $lte: 0 };

    if (toArr(size).length) query.size = { $in: toArr(size) };

    // Search: naam, brand, category (teeno level) mein. Rating bhi $or use karta hai → $and se jodo
    if (search && String(search).trim() !== "") {
      const rx = { $regex: String(search).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      query.$and = [{ $or: [{ name: rx }, { brand: rx }, { catName: rx }, { subCat: rx }, { thirdSubCat: rx }] }];
    }

    const sortFields = { name: "name", price: "price", rating: "rating", createdAt: "createdAt", discount: "discount" };
    const sort = sortFields[sortBy]
      ? { [sortFields[sortBy]]: order === "desc" ? -1 : 1 }
      : { createdAt: -1 };

    const perPage = Math.min(Math.max(parseInt(limit) || 12, 1), 100);
    const currentPage = Math.max(parseInt(page) || 1, 1);

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      error: false,
      success: true,
      products,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    return res.status(500).json({ error: true, success: false, message: error.message });
  }
};

// GET /api/product/search-suggestions?q=  → header dropdown ke liye top 5 (halka data)
export const searchSuggestions = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 100);
    if (q.length < 2) return res.status(200).json({ error: false, success: true, data: [] });
    const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const data = await Product.find({ $or: [{ name: rx }, { brand: rx }, { catName: rx }, { subCat: rx }, { thirdSubCat: rx }] })
      .select("name images price brand")
      .sort({ rating: -1, createdAt: -1 })
      .limit(5);
    return res.status(200).json({ error: false, success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};
