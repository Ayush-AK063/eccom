import { inHiddenCategory } from "../utils/hiddenCategories.js";
import { logActivity, optionalUserId } from "../utils/activity.js";
import { logSearch } from "../models/SearchLog.js";
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

const str = (v, max = 5000) => (v === undefined || v === null ? "" : String(v).trim().slice(0, max));
const num = (v, min = 0) => Math.max(min, Number(v) || 0);
const strList = (v, max = 30) => (Array.isArray(v) ? v : []).map((x) => str(x, 300)).filter(Boolean).slice(0, max);
const slugify = (s) => str(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);

// Admin form ka body → saaf product data (create + update dono)
const buildProductData = (b = {}) => {
  // Option groups (max 4): [{ name, display, unit, values, hex }]
  const variantOptions = (Array.isArray(b.variantOptions) ? b.variantOptions : []).slice(0, 4).map((g) => {
    const seen = new Set();
    const values = (Array.isArray(g?.values) ? g.values : []).map((x) => str(x, 60)).filter((x) => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase())).slice(0, 100);
    const hex = {};
    for (const v of values) if (/^#[0-9a-f]{6}$/i.test(g?.hex?.[v] || "")) hex[v] = g.hex[v];
    return { name: str(g?.name, 40), display: ["buttons", "swatch", "dropdown"].includes(g?.display) ? g.display : "buttons", unit: str(g?.unit, 12), values, hex };
  }).filter((g) => g.name && g.values.length);
  const groupNames = variantOptions.map((g) => g.name);

  const variants = (Array.isArray(b.variants) ? b.variants : []).slice(0, 300).map((v) => ({
    ...(v._id && /^[a-f0-9]{24}$/i.test(v._id) ? { _id: v._id } : {}),
    options: Object.fromEntries(groupNames.map((n) => [n, str(v?.options?.[n], 60)])),
    sku: str(v.sku, 80),
    size: str(v.size, 60),
    productRam: str(v.productRam, 60),
    productWeight: str(v.productWeight, 60),
    color: str(v.color, 60),
    price: num(v.price),
    oldprice: num(v.oldprice),
    stock: Math.floor(num(v.stock)),
    image: str(v.image, 1000),
  }));
  const s = b.shipping || {}, c = b.compliance || {}, p = b.policy || {}, seo = b.seo || {};
  const price = num(b.price), oldprice = num(b.oldprice);
  return {
    name: str(b.name, 200),
    description: str(b.description, 20000),
    shortDescription: str(b.shortDescription, 500),
    highlights: strList(b.highlights, 10),
    tags: strList(b.tags, 30),
    images: strList(b.images, 20),
    videoUrl: str(b.videoUrl, 500),
    brand: str(b.brand, 120) || null,
    modelNumber: str(b.modelNumber, 120),
    sku: str(b.sku, 80),
    barcode: str(b.barcode, 40),
    status: ["active", "draft", "archived"].includes(b.status) ? b.status : "active",
    price,
    oldprice: oldprice || price,
    discount: oldprice > price && price > 0 ? Math.round(((oldprice - price) / oldprice) * 100) : 0,
    costPrice: num(b.costPrice),
    gstRate: [0, 3, 5, 12, 18, 28].includes(Number(b.gstRate)) ? Number(b.gstRate) : 0,
    hsnCode: str(b.hsnCode, 12),
    catName: b.catName || null,
    catId: b.catId || null,
    subCatId: b.subCatId || null,
    subCat: b.subCat || null,
    thirdSubCatId: b.thirdSubCatId || null,
    thirdSubCat: b.thirdSubCat || null,
    countInStock: Math.floor(num(b.countInStock)),
    lowStockThreshold: Math.floor(num(b.lowStockThreshold ?? 5)),
    maxOrderQty: Math.floor(num(b.maxOrderQty)),
    rating: Math.min(5, num(b.rating)),
    productFlags: strList(b.productFlags, 5),
    productRam: toVariantArr(b.productRam),
    size: toVariantArr(b.size),
    productWeight: toVariantArr(b.productWeight),
    color: toVariantArr(b.color),
    variantOptions,
    variants,
    specifications: (Array.isArray(b.specifications) ? b.specifications : []).slice(0, 100)
      .map((x) => ({ group: str(x.group, 60) || "General", key: str(x.key, 60), label: str(x.label, 80), value: str(x.value, 500), unit: str(x.unit, 20) }))
      .filter((x) => x.label && x.value),
    shipping: {
      weight: num(s.weight), length: num(s.length), width: num(s.width), height: num(s.height),
      dispatchDays: Math.floor(num(s.dispatchDays ?? 2)),
      codAvailable: s.codAvailable !== false,
      freeShipping: !!s.freeShipping,
    },
    compliance: {
      countryOfOrigin: str(c.countryOfOrigin, 60) || "India",
      manufacturer: str(c.manufacturer, 500), importer: str(c.importer, 500), packer: str(c.packer, 500),
      netQuantity: str(c.netQuantity, 60), mfgDate: str(c.mfgDate, 20), expiryDate: str(c.expiryDate, 20),
      customerCare: str(c.customerCare, 300), licenseNo: str(c.licenseNo, 80),
    },
    policy: {
      returnable: p.returnable !== false,
      returnDays: Math.floor(num(p.returnDays ?? 7)),
      returnType: ["return", "replace", "none"].includes(p.returnType) ? p.returnType : "return",
      warrantyMonths: Math.floor(num(p.warrantyMonths)),
      warrantyType: str(p.warrantyType, 60),
      inTheBox: str(p.inTheBox, 1000),
    },
    seo: { slug: slugify(seo.slug || b.name), metaTitle: str(seo.metaTitle, 120), metaDescription: str(seo.metaDescription, 300) },
  };
};

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
    const data = buildProductData(req.body);
    if (!data.name) return res.status(400).json({ message: "Product name is required", error: true, success: false });
    const product = await new Product(data).save();
    return res.status(201).json({ product, message: "Product created successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
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
      // regex special chars escape (warna "(" jaisa search crash karta)
      const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [{ name: { $regex: safe, $options: "i" } }, { brand: { $regex: safe, $options: "i" } }];
    }
    if (req.query.flag && req.query.flag !== "") {
      query.productFlags = { $in: [req.query.flag] };
    }
    // Admin: stock filter (in / low / out)
    if (req.query.stock === "out") query.countInStock = { $lte: 0 };
    else if (req.query.stock === "low") query.countInStock = { $gt: 0, $lte: 5 };
    else if (req.query.stock === "in") query.countInStock = { $gt: 5 };

    const SORTS = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      stock_asc: { countInStock: 1 },
      name: { name: 1 },
    };
    const sort = SORTS[req.query.sort] || null;

    // Admin (?admin=1): draft/archived bhi; ?status= se filter
    const adminView = req.query.admin === "1";
    if (adminView && ["active", "draft", "archived"].includes(req.query.status)) {
      query.status = req.query.status === "active" ? { $nin: ["draft", "archived"] } : req.query.status;
    }
    const opts = adminView ? { includeHidden: true } : {};

    const totalPosts = await Product.countDocuments(query).setOptions(opts);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json({ message: "Invalid page number", error: true, success: false });
    }

    let finder = Product.find(query).setOptions(opts).populate("catId");
    if (sort) finder = finder.sort({ ...sort, _id: -1 });
    const products = await finder
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
      totalPosts,
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

    // Cloudinary se images hatao (fail ho to bhi product delete ho)
    for (const imgUrl of images || []) {
      const imagename = String(imgUrl).split("/").pop().split(".")[0];
      if (imagename) await cloudinary.uploader.destroy(imagename).catch(() => {});
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

    // draft / archived storefront par nahi (admin ?admin=1 se dekh sakta hai)
    if (!product || (req.query.admin !== "1" && (["draft", "archived"].includes(product.status) || (await inHiddenCategory(product))))) {
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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found", error: true, success: false });
    const data = buildProductData(req.body);
    if (!data.name) return res.status(400).json({ message: "Product name is required", error: true, success: false });
    product.set(data);
    await product.save(); // pre-save: variants se stock/price sync
    return res.status(200).json({ product, message: "Product updated successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided", error: true, success: false });
    }

    const products = await Product.find({ _id: { $in: ids } }).setOptions({ includeHidden: true });

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
      flag = "",
      minDiscount,
      ids = [],
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
    // Home sections: flag (popular / deal / ...), kam se kam discount, chune hue products
    if (flag) query.productFlags = { $in: [String(flag)] };
    if (Number(minDiscount) > 0) query.discount = { $gte: Number(minDiscount) };
    const idList = toArr(ids).filter((id) => /^[a-f\d]{24}$/i.test(String(id)));
    if (idList.length) query._id = { $in: idList };

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

    // Customer ki search (pehla page) — admin Insights ke liye
    if (search && String(search).trim() && currentPage === 1) {
      logSearch(search, total);
      logActivity(optionalUserId(req), "search", { term: String(search).trim().slice(0, 80), results: total }, req);
    }

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
