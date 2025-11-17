const Kiosk = require("../models/Kiosk");
const Store = require("../models/Store");

const kioskController = {};

kioskController.getAllKiosk = async (req, res) => {
  try {
    // Get all stores of the logged-in user
    const stores = await Store.find({ user: req.user._id });
    if (!stores || stores.length === 0) {
      return res.status(200).json([]);
    }
    const kiosks = await Kiosk.find({
      store: { $in: stores.map((s) => s._id) },
    }).populate("store");
    if (!kiosks || kiosks.length === 0) {
      console.log("Không tìm thấy kiosk");
    }
    return res.status(200).json(kiosks);
  } catch (err) {
    console.log("Lỗi getAllKiosk", err);
    return res.status(500).json("Lỗi getAllKiosk");
  }
};

kioskController.getKioskById = async (req, res) => {
  try {
    const { kioskId } = req.params;
    const kiosk = await Kiosk.findById(kioskId);
    if (!kiosk) {
      return res.status(404).json({ msg: "Không tìm thấy kiosk" });
    }
    return res.status(200).json(kiosk);
  } catch (err) {
    console.log("Lỗi getKioskById", err);
    return res.status(500).json("Lỗi getKioskById");
  }
};

kioskController.getKioskByCode = async (req, res) => {
  try {
    const { code } = req.params;
    console.log("🚀 ~ code:", code)
    const stores = await Store.find({ user: req.user._id });
    if (!stores || stores.length === 0) {
      return res.status(200).json([]);
    }

    const kiosk = await Kiosk.findOne({
      code,
      store: { $in: stores.map((s) => s._id) },
    }).populate("store");
    console.log("🚀 ~ kiosk:", kiosk)
    if (!kiosk) {
      return res.status(404).json({ msg: "Không tìm thấy kiosk" });
    }
    return res.status(200).json(kiosk);
  } catch (err) {
    console.log("Lỗi getKioskByCode", err);
    return res.status(500).json("Lỗi getKioskByCode");
  }
};

kioskController.updateKiosk = async (req, res) => {
  try {
    const { kioskId } = req.params;
    const { location, storeId } = req.body;

    const oldKiosk = await Kiosk.findById(kioskId);
    if (!oldKiosk) {
      return res.status(404).json({ msg: "Không tìm thấy kiosk" });
    }

    // update kiosk
    const kiosk = await Kiosk.findByIdAndUpdate(
      kioskId,
      { location, store: storeId },
      { new: true, runValidators: true }
    );

    // nếu đổi store thì update cả Store.kiosks
    if (storeId && storeId.toString() !== oldKiosk.store?.toString()) {
      // xoá kiosk khỏi store cũ
      if (oldKiosk.store) {
        await Store.findByIdAndUpdate(oldKiosk.store, {
          $pull: { kiosks: kioskId },
        });
      }
      // thêm kiosk vào store mới
      await Store.findByIdAndUpdate(storeId, {
        $addToSet: { kiosks: kioskId },
      });
    }

    return res.status(200).json(kiosk);
  } catch (err) {
    console.log("Lỗi updateKiosk", err);
    return res.status(500).json("Lỗi updateKiosk");
  }
};

kioskController.newKiosk = async (req, res) => {
  try {
    const { location, storeId } = req.body;
    console.log("🚀 ~ Creating kiosk:", { location, storeId });

    if (!storeId) {
      return res.status(400).json({ msg: "Thiếu storeId" });
    }

    // Verify store belongs to the logged-in user
    const store = await Store.findOne({ _id: storeId, user: req.user._id });
    if (!store) {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy store hoặc không thuộc người dùng này" });
    }

    // Find all kiosks belonging to this user's stores
    const userStores = await Store.find({ user: req.user._id }).select("_id");
    const kiosks = await Kiosk.find({
      store: { $in: userStores.map((s) => s._id) },
    }).sort({ code: -1 });

    // Determine next kiosk code
    let newCode = "K001";
    if (kiosks.length > 0 && kiosks[0].code) {
      const lastNumber = parseInt(kiosks[0].code.slice(1), 10);
      const nextNumber = lastNumber + 1;
      newCode = "K" + nextNumber.toString().padStart(3, "0");
    }

    // Create the kiosk
    const kiosk = await Kiosk.create({
      location,
      store: storeId,
      code: newCode,
    });

    // Update store.kiosks
    await Store.findByIdAndUpdate(storeId, { $push: { kiosks: kiosk._id } });

    return res.status(201).json({
      msg: "Tạo kiosk thành công",
      kiosk,
    });
  } catch (err) {
    console.error("❌ Lỗi newKiosk:", err);
    return res.status(500).json({ msg: "Lỗi newKiosk", error: err.message });
  }
};

kioskController.deleteKiosks = async (req, res) => {
  try {
    let { kioskIds } = req.body;

    if (!kioskIds || kioskIds.length === 0) {
      return res.status(400).json({ msg: "Không có kiosk nào được cung cấp" });
    }

    // Nếu chỉ truyền 1 id dạng string thì convert sang mảng
    if (!Array.isArray(kioskIds)) {
      kioskIds = [kioskIds];
    }
    const kiosksToDelete = await Kiosk.find({ _id: { $in: kioskIds } });
    for (const kiosk of kiosksToDelete) {
      if (kiosk.store) {
        await Store.findByIdAndUpdate(kiosk.store, {
          $pull: { kiosks: kiosk._id },
        });
      }
    }
    // Xóa nhiều kiosk
    const result = await Kiosk.deleteMany({ _id: { $in: kioskIds } });
    return res.status(201).json({
      msg: "Xóa kiosks thành công",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    return res.status(500).json("Lỗi xóa kiosk");
  }
};

module.exports = kioskController;
