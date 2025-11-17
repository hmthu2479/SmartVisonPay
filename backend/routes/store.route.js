const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleware')
const StoreController = require('../controller/store.controller')

//update thông tin store
// cung cấp
//token
//body : {address, kioskId, productId, action}
//params : {storeId}
router.put('/update/:storeId', authMiddleWare, StoreController.updateStore)

//Lấy danh sách tất cả store
// cung cấp
//token
router.get('/all', authMiddleWare, StoreController.getAllStore)

//Lấy thông tin store theo id
// cung cấp
//token
//params : {storeId}
router.get('/:storeId', authMiddleWare, StoreController.getStoreById)

//Tạo store mới
// cung cấp
//token
//body:{address}
router.post('/new', authMiddleWare, StoreController.newStore)

//Xóa 1 hoặc nhiều store
// cung cấp
//token
//body : {storeIds}
router.post('/delete', authMiddleWare, StoreController.deleteStores)


module.exports = router;