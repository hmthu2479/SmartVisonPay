const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.changePassword = async (req,res) =>{
  try{
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    const isPasswordValid = await bcrypt.compare(
          oldPassword,
          user.password,
        );
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(userId, {
        password: hashedPassword,
    });
    
    return res.status(200).json(updatedUser);
  }catch(err){
    console.log('Lỗi đổi mật khẩu', err);
    return res.status(500).json({msg : 'Lỗi đổi mật khẩu'})
  }
}

module.exports = userController;
