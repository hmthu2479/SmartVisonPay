const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleware')
const KioskController = require('../controller/kiosk.controller')

//update thông tin kiosk
// cung cấp
//token
//body : {location,storeId}
//params : {kioskId}
router.put('/update/:kioskId', authMiddleWare, KioskController.updateKiosk)

//Lấy danh sách tất cả kiosk
// cung cấp
//token
router.get('/all', authMiddleWare, KioskController.getAllKiosk)

//Lấy thông tin kiosk theo id
// cung cấp
//token
//params : {kioskId}
router.get('/:kioskId', authMiddleWare, KioskController.getKioskById)

//Lấy thông tin kiosk theo code
// cung cấp
//token
//params : {code}
router.get('/code/:code', authMiddleWare, KioskController.getKioskByCode)

//Tạo kiosk mới
// cung cấp
//token
//body:{location, storeId}
router.post('/new', authMiddleWare, KioskController.newKiosk)

//Xóa 1 hoặc nhiều kiosk
// cung cấp
//token
//body : {kioskIds}
router.post('/delete', authMiddleWare, KioskController.deleteKiosks)


module.exports = router;