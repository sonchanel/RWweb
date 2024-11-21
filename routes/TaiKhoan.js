var express = require('express');
var router = express.Router();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express()

router.post('/taodeckmoi',async (req,res)=>{
  const { addon, namedeck } = req.body;
  const usernamecheck = req.cookies['username'];
  if(addon.length === 0){
    return res.status(400).send({error: "Thiếu thông tin"});
  }
  try{
    const id_user = await req.truyvan(`SELECT * FROM Users WHERE Username = '${usernamecheck}'`);

    const decks = await req.truyvan(`SELECT * FROM Decks WHERE user_id = '${id_user[0].id}' and addon = '${addon}'`);
  
    let sothutu = 1;
    let dieukien = true;
    while(dieukien){
      dieukien = false
      decks.forEach(deck => {
        if("New deck " + sothutu.toString() == deck.name){
          sothutu += 1;
          dieukien = true;
        }
        })
      };
    let tendeck = "New deck " + sothutu.toString();
    const status = await req.truyvan(`INSERT INTO Decks (user_id, name, addon) VALUES ('${id_user[0].id}', '${tendeck}', '${addon}');`)
    const id_deck = await req.truyvan(`SELECT * FROM Decks WHERE user_id = '${id_user[0].id}' and name = '${tendeck}' and addon = '${addon}'`);
 
    return res.status(200).send({ iddeck: id_deck[0].id });
  }catch{
    return res.status(400).json({ error: 'Lỗi hệ thống' });
  }
});

router.post('/edit',async (req,res)=>{
  const { newEmail } = req.body;
  const usernamecheck = req.cookies['username'];
  if(newEmail.length === 0){
    return res.status(400).json({ error: 'Vui lòng nhập email' });
  }
  try{
    const status = await req.truyvan(`UPDATE Users SET Email = '${newEmail}' WHERE username = '${usernamecheck}'`)
    console.log(status)
    return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  }catch{
    return res.status(400).json({ error: 'Cập nhật thất bại' });
  }
});

router.post('/logout',async (req, res) => {
  if(req.cookies.user){
    res.clearCookie('user');
    res.clearCookie('username');
    return res.status(200).json({ message: 'Đăng xuất thành công' });
  }else{
    return res.status(400).json({ error: 'Bạn chưa đăng nhập' });
  }
});

router.post('/changepassword',async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword)
  console.log(newPassword)
  const usernamecheck = req.cookies['username'];
  const user = await req.truyvan(`SELECT * FROM Users WHERE Username = '${usernamecheck}'`)
  const hashedOldPassword = user[0].Password;
  console.log(hashedOldPassword)
  
  if(await bcrypt.compare(oldPassword,hashedOldPassword)){
    if(oldPassword === newPassword){
      return res.status(400).json({ error: 'Mật khẩu mới không được trùng với mật khẩu cũ' });
    } 
    try{
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const status = await req.truyvan(`UPDATE Users SET Password = '${hashedNewPassword}' WHERE username = '${usernamecheck}'`)
      console.log(status)
      return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    }catch{
      return res.status(400).json({ error: 'Cập nhật thất bại' });
    }
  }else{
    return res.status(400).json({ error: 'Sai mật khẩu' });
  }
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  const useridcheck = req.cookies['user'];
  const usernamecheck = req.cookies['username'];
  if (!useridcheck) {
    return res.redirect('/DangNhap')
  }
  const user = await req.truyvan(`SELECT * FROM Users WHERE username = '${usernamecheck}'`)
  const userid = user[0].id.toString()
  const username = user[0].username
  if(await !bcrypt.compare(userid,useridcheck)){
    return res.redirect('/DangNhap')
  } 


  //Thẻ user sở hữu
  const user_card_attack = await req.truyvan(`SELECT id_card,quantity,User_Card.addon,Attack_Card.* FROM User_Card,Attack_Card WHERE User_Card.id_card = Attack_Card.id and id_user = '${userid}' and User_Card.addon = 'Attack'`)
  const user_card_defense = await req.truyvan(`SELECT id_card,quantity,User_Card.addon,Defense_Card.* FROM User_Card,Defense_Card WHERE User_Card.id_card = Defense_Card.id and id_user = '${userid}' and User_Card.addon = 'Defense'`)
  const link_card_attack = req.imageLinksAT;
  const link_card_defednse = req.imageLinksDF;
  //console.log(link_card_attack[0])
  //console.log(user_card_attack[0])

  const user_cardAT = user_card_attack.map(user => {
    const correspondingLink = link_card_attack.find(link => link.name === user.Card_Link);
    return {
      ...user, // Giữ lại tất cả các trường của user
      link: correspondingLink ? correspondingLink.link : null // Thêm trường link nếu tìm thấy
    };
  });

  const user_cardDF = user_card_defense.map(user => {
    const correspondingLink = link_card_defednse.find(link => link.name === user.Card_Link);
    return {
      ...user, // Giữ lại tất cả các trường của user
      link: correspondingLink ? correspondingLink.link : null // Thêm trường link nếu tìm thấy
    };
  });

  const user_card =  [...user_cardAT,...user_cardDF];

  console.log(user_card)
  let cardnumber = 0
  user_card.forEach(card=>{
    cardnumber += card.quantity;
  });
  const categories = ['Attack','Defense'];
  //-------------------------------------------------
  //Deck sở hữu
  const user_deck_attack = await req.truyvan(`SELECT Decks.* FROM Decks WHERE user_id = '${userid}' and addon = 'Attack'`)
  const user_deck_defense = await req.truyvan(`SELECT Decks.* FROM Decks WHERE user_id = '${userid}' and addon = 'Defense'`)

  const user_deck = [...user_deck_attack,...user_deck_defense];
  console.log(user_deck)
  //-------------------------------------------------
  //Tài khoản
  //user
  console.log(user)
  //-------------------------------------------------
  //Shop
  const shop = await req.truyvan(`SELECT * FROM Shop`);
  //------------------------------------------------


  res.render('TaiKhoan', { title: 'Express' ,user_card, cardnumber ,categories ,user_deck, user, shop});
});


module.exports = router;
