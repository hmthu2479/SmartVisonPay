const Store = require("../models/Store");
const Kiosk = require("../models/Kiosk");
const storeController = {};

storeController.getAllStore = async (req, res) => {
  try {
    const stores = await Store.find({ user: req.user._id }).populate(
      "kiosks products"
    );
    if (!stores) {
      return res.status(404).json({ msg: "Không tìm thấy store" });
    }
    return res.status(200).json(stores);
  } catch (err) {
    console.log("Lỗi getAllStore", err);
    return res.status(500).json("Lỗi getAllStore");
  }
};

storeController.getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findById(storeId).populate("kiosks products");
    if (!store) {
      return res.status(404).json({ msg: "Không tìm thấy store" });
    }
    return res.status(200).json(store);
  } catch (err) {
    console.log("Lỗi getStoreById", err);
    return res.status(500).json("Lỗi getStoreById");
  }
};

storeController.updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { address, kioskId, productId, action } = req.body;

    let update = {};

    if (address) {
      update.address = address;
    }

    if (kioskId) {
      if (action === "add") update.$push = { kiosks: kioskId };
      if (action === "remove") update.$pull = { kiosks: kioskId };
    }

    if (productId) {
      if (action === "add") update.$push = { products: productId };
      if (action === "remove") update.$pull = { products: productId };
    }

    const store = await Store.findByIdAndUpdate(storeId, update, {
      new: true,
      runValidators: true,
    });

    if (!store) {
      return res.status(404).json({ msg: "Không tìm thấy store" });
    }

    return res.status(200).json(store);
  } catch (err) {
    console.log("Lỗi updateStore", err);
    return res.status(500).json("Lỗi updateStore");
  }
};

storeController.newStore = async (req, res) => {
  try {
    const { address } = req.body;

    const store = await Store.create({
      user: req.user._id,
      address,
      products: [],
      kiosks: [],
    });

    return res.status(201).json({
      msg: "Tạo store thành công",
      store,
    });
  } catch (err) {
    return res.status(500).json("Lỗi newStore");
  }
};

storeController.deleteStores = async (req, res) => {
  try {
    let { storeIds } = req.body;
    if (!storeIds || storeIds.length === 0) {
      return res.status(400).json({ msg: "Không có store nào được cung cấp" });
    }

    // Nếu chỉ truyền 1 id dạng string thì convert sang mảng
    if (!Array.isArray(storeIds)) {
      storeIds = [storeIds];
    }

    // 1️⃣ Delete all kiosks under each store from store array
    await Kiosk.deleteMany({ store: { $in: storeIds } }, "_id");
    // Xóa nhiều store
    const result = await Store.deleteMany({ _id: { $in: storeIds } });
    return res.status(201).json({
      msg: "Xóa stores thành công",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.log("🚀 ~ err:", err);
    return res.status(500).json("Lỗi xóa store");
  }
};

module.exports = storeController;
