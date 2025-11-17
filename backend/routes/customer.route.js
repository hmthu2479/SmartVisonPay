const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleware')
const CustomerController = require('../controller/customer.controller')

//update thông tin khách hàng
// cung cấp
//token
//body : {name, points}
//params : {customerId}
router.put('/update/:customerId', authMiddleWare, CustomerController.updateCustomer)

//Lấy danh sách tất cả khách hàng
// cung cấp
//token
router.get('/all', authMiddleWare, CustomerController.getAllCustomer)

//Lấy thông tin khách hàng theo id
// cung cấp
//token
//params : {customerId}
router.get('/id/:customerId', authMiddleWare, CustomerController.getCustomerById)

//Lấy thông tin khách hàng theo phone
// cung cấp
//token
//params : {phone}
router.get('/phone/:customerPhone', authMiddleWare, CustomerController.getCustomerByPhone)

//Tạo khách hàng mới
// cung cấp
//token
router.post('/new', authMiddleWare, CustomerController.newCustomer)

//Xóa 1 hoặc nhiều khách hàng
// cung cấp
//token
//body : {customerIds}
router.post('/delete', authMiddleWare, CustomerController.deleteCustomers)


module.exports = router;