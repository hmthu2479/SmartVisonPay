const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleware')
const ProductController = require('../controller/product.controller')

//Lấy danh sách tất cả product
// cung cấp
//token
router.get('/all', authMiddleWare, ProductController.getAllProduct)

//Lấy danh sách product theo store
// cung cấp
//token
//body:{storeIds}
router.post('/store', authMiddleWare, ProductController.getProductsByStore)

//Lấy thông tin product theo tên sp
// cung cấp
//token
//body : {productsName, storeId}
router.post('/name', authMiddleWare, ProductController.getProductsByName)

//Lấy thông tin product theo id
// cung cấp
//token
//params : {productId}
router.get('/:productId', authMiddleWare, ProductController.getProductById)

//Tạo product mới
// cung cấp
//token
//body: {name, storeId, price, quantity}
router.post('/new', authMiddleWare, ProductController.newProduct)

//update thông tin product
// cung cấp
//token
//body : {name, storeId, price, quantity}
//params : {productId}
router.put('/update/:productId', authMiddleWare, ProductController.updateProduct)

//Xóa 1 hoặc nhiều product
// cung cấp
//token
//body : {productIds}
router.post('/delete', authMiddleWare, ProductController.deleteProducts)


module.exports = router;