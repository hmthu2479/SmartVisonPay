const Product = require("../models/Product");
const Store = require("../models/Store");

const productController = {};

productController.getAllProduct = async (req, res) => {
  try {
    // 1️⃣ Get all stores of the logged-in user
    const stores = await Store.find({ user: req.user._id });
    if (!stores || stores.length === 0) {
      return res.status(200).json([]);
    }
    const products = await Product.find({
      store: { $in: stores.map((s) => s._id) },
    }).populate("store");
    if (products.length === 0) {
      return res.status(404).json({ msg: "Không tìm thấy product" });
    }
    return res.status(200).json(products);
  } catch (err) {
    console.log("Lỗi getAllProduct", err);
    return res.status(500).json("Lỗi getAllProduct");
  }
};

productController.getProductsByStore = async (req, res) => {
  try {
    const { storeId } = req.body;
    const products = await Product.find({ store: { $in: storeId } });

    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Lỗi khi tìm products" });
  }
};

productController.getProductsByName = async (req, res) => {
  try {
    const { productsName, storeId } = req.body;
    if (!storeId || !Array.isArray(productsName) || productsName.length === 0) {
      return res
        .status(400)
        .json({
          msg: "productsName must be a non-empty array or missing storeId",
        });
    }
    const products = await Product.find({
      store: { $in: storeId },
      name: { $in: productsName },
    });

    // Find only exact product from name
    const uniqueProducts = productsName.map(
      (name) => products.find((p) => p.name === name) || null
    );

    return res.status(200).json(uniqueProducts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Lỗi khi tìm products" });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Không tìm thấy product" });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.log("Lỗi getProductById", err);
    return res.status(500).json("Lỗi getProductById");
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(404).json({ msg: "Không tìm thấy productId" });
    }

    const { name, storeId, price, quantity } = req.body;

    const oldProduct = await Product.findById(productId);
    if (!oldProduct) {
      return res.status(404).json({ msg: "Không tìm thấy product" });
    }

    // build update object
    let update = {};
    if (name) update.name = name;
    if (storeId) update.store = storeId;
    if (price) update.price = price;
    if (quantity) update.quantity = quantity;

    const product = await Product.findByIdAndUpdate(productId, update, {
      new: true,
      runValidators: true,
    });

    // Nếu store thay đổi thì update lại Store.products
    if (storeId && storeId.toString() !== oldProduct.store?.toString()) {
      // xoá product khỏi store cũ
      await Store.findByIdAndUpdate(oldProduct.store, {
        $pull: { products: productId },
      });
      // thêm product vào store mới
      await Store.findByIdAndUpdate(storeId, {
        $push: { products: productId },
      });
    }

    return res.status(200).json(product);
  } catch (err) {
    console.log("Lỗi updateProduct", err);
    return res.status(500).json("Lỗi updateProduct");
  }
};

productController.newProduct = async (req, res) => {
  try {
    const { name, storeId, price, quantity } = req.body;
    if (!storeId) {
      return res.status(404).json({ msg: "Store không tồn tại" });
    }
    const product = await Product.create({
      name,
      store: storeId,
      price,
      quantity,
    });

    // ✅ update luôn Store.products
    await Store.findByIdAndUpdate(storeId, {
      $push: { products: product._id },
    });

    return res.status(201).json({
      msg: "Tạo product thành công",
      product,
    });
  } catch (err) {
    return res.status(500).json("Lỗi newProduct");
  }
};

productController.deleteProducts = async (req, res) => {
  try {
    let { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
      return res
        .status(400)
        .json({ msg: "Không có product nào được cung cấp" });
    }

    // Nếu chỉ truyền 1 id dạng string thì convert sang mảng
    if (!Array.isArray(productIds)) {
      productIds = [productIds];
    }

    //Xóa products của store
    const productsToDelete = await Product.find({ _id: { $in: productIds } });
    for (const product of productsToDelete) {
      if (product.store) {
        await Store.findByIdAndUpdate(product.store, {
          $pull: { products: product._id },
        });
      }
    }

    // Xóa nhiều product
    const result = await Product.deleteMany({ _id: { $in: productIds } });
    return res.status(201).json({
      msg: "Xóa products thành công",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    return res.status(500).json("Lỗi xóa product");
  }
};

module.exports = productController;
