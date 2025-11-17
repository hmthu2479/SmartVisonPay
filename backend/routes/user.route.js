const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleware')
const UserController = require('../controller/user.controller')

//Đổi mật khẩu
// cung cấp
//token
//body : { oldPassword, newPassword }
router.post('/changepassword', authMiddleWare, UserController.changePassword)


module.exports = router;