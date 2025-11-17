const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Import model User
const authMiddleware = require('../middlewares/authMiddleware')
const SearchController= require('../controller/search.controller')

// route tìm kiếm
//body{searchTerm}
// tìm kiếm người dùng số điện thoại hoặc tên
// sử dụng phương thức POST để gửi dữ liệu tìm kiếm
router.post('/customer', authMiddleware, SearchController.getCustomersByNameAndPhone);

// route tìm kiếm sản phẩm
//body{searchTerm}
// tìm kiếm bằng tên
// sử dụng phương thức POST để gửi dữ liệu tìm kiếm
router.post('/product', authMiddleware, SearchController.getProductsByName);

module.exports = router;  // Export router để sử dụng trong server.js