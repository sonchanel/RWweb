var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser')
var app = express();

router.post('/register', async (req, res) => {
  console.log('a')
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Hãy nhập đầy đủ thông tin' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 kí tự'});
  }
  // Kiểm tra password và confirmPassword
  if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Nhập sai mật khẩu' });
  }
  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Kiểm tra xem email đã tồn tại chưa
  const email_existed = await req.truyvan(`SELECT * FROM Users WHERE email = '${email}'`)
  console.log(email_existed.length)
  if(email_existed.length > 0){
    return res.status(400).json({ error: 'Email đã tồn tại' });
  }
  const username_existed = await req.truyvan(`SELECT * FROM Users WHERE username = '${username}'`)
  if(username_existed.length > 0){
    return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
  }
  try{
      // Thêm người dùng mới vào database
      const query = `INSERT INTO Users (username, email, password) VALUES ('${username}','${email}','${hashedPassword}')`
      console.log(query)
      req.truyvan(query)
  }catch{
          if (err) {
              return res.status(400).json({ error: 'Đăng kí không thành công' });
          }
  }
  return res.status(200).json({ message: 'Đăng kí thành công' });
});


router.post('/login', async (req, res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({ error: 'Hãy nhập đầy đủ thông tin' });
  }
  const user = await req.truyvan(`SELECT * FROM Users WHERE username = '${username}'`)
  console.log(user)
  if(user.length > 0){
    if(await bcrypt.compare(password, user[0].Password)){
      console.log('Passwords match! User authenticated.');
      const key = await bcrypt.hash(user[0].id.toString(), 10);
      res.cookie('user',key,{ expires: new Date(Date.now() + 2592000000)})
      res.cookie('username',user[0].Username,{ expires: new Date(Date.now() + 2592000000)})
      console.log(user[0].id.toString())
      //return res.redirect('/TaiKhoan')
      return res.status(200).json({ message: 'Đăng nhập thành công' });
    }else{
      console.log('Passwords do not match! Authentication failed.');
      return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    }
  }else{
    return res.status(400).json({ error: 'Tài khoản không tồn tại' });
  }
});

router.post('/forget', async (req, res) => {
  
});



/* GET home page. */
router.get('/',async function(req, res, next) {
  const useridcheck = req.cookies['user'];
  const usernamecheck = req.cookies['username'];
  if (useridcheck) {
    const user = await req.truyvan(`SELECT * FROM Users WHERE username = '${usernamecheck}'`)
    const userid = user[0].id.toString()
    const username = user[0].username
    if(await bcrypt.compare(userid,useridcheck)){
      return res.redirect('/TaiKhoan')
    }
    }
    res.render('DangNhap', { title: 'Express' ,
      message: 'Hello, World!',
      A : ['1','2','3']
    });
});


module.exports = router;
