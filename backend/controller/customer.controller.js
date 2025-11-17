const Customer = require("../models/Customer");

const customerController = {};

customerController.getAllCustomer = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user._id });
    if (!customers) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }
    return res.status(200).json(customers);
  } catch (err) {
    console.log("Lỗi getAllCustomer", err);
    return res.status(500).json("Lỗi getAllCustomer");
  }
};

customerController.getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }
    return res.status(200).json(customer);
  } catch (err) {
    console.log("Lỗi getCustomerById", err);
    return res.status(500).json("Lỗi getCustomerById");
  }
};

customerController.getCustomerByPhone = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const customer = await Customer.findOne({ phone: customerPhone });
    if (!customer) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }
    return res.status(200).json(customer);
  } catch (err) {
    console.log("Lỗi getCustomerById", err);
    return res.status(500).json("Lỗi getCustomerById");
  }
};

customerController.updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, points } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { name, points },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }
    return res.status(200).json(customer);
  } catch (err) {
    console.log("Lỗi updateCustomer", err);
    return res.status(500).json("Lỗi updateCustomer");
  }
};

customerController.newCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const existed = await Customer.findOne({ phone });
    if (existed) {
      return res.status(400).json({ msg: "Số điện thoại đã tồn tại" });
    }
    const customer = await Customer.create({
      user: req.user._id,
      name,
      phone,
      points: 0,
    });

    return res.status(201).json({
      msg: "Tạo khách hàng thành công",
      customer,
    });
  } catch (err) {
    console.log("Lỗi newCustomer", err);
    return res.status(500).json("Lỗi newCustomer");
  }
};

customerController.deleteCustomers = async (req, res) => {
  try {
    let { customerIds } = req.body;
    if (!customerIds || customerIds.length === 0) {
      return res.status(400).json({ msg: "Không có store nào được cung cấp" });
    }

    // Nếu chỉ truyền 1 id dạng string thì convert sang mảng
    if (!Array.isArray(customerIds)) {
      customerIds = [customerIds];
    }

    // Xóa nhiều Customer
    const result = await Customer.deleteMany({ _id: { $in: customerIds } });
    return res.status(201).json({
      msg: "Xóa Customers thành công",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.log("🚀 ~ err:", err);
    return res.status(500).json("Lỗi xóa Customer");
  }
};
module.exports = customerController;