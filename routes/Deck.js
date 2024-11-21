var express = require('express');
var router = express.Router();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express()


router.post('/xacnhan', async (req,res) => {
  const { cards, quantitys, iddeck, tendeck, motadeck } = req.body;
  console.log(cards, quantitys)
  //const id_deck = req.query.id_deck;
  console.log(iddeck)
  let updateCard = [];
  try{
  const deck = await req.truyvan(`SELECT * FROM Decks WHERE id = '${iddeck}'`)
  console.log(deck)
  for (let i = 0; i < cards.length; i++) {
    updateCard.push({name: cards[i], quantity: quantitys[i]});
  }
  const capnhat = await updateCard.map(async item => {
    let id_cards = [];
    if(deck[0].addon == 'Attack'){
      id_cards = await req.truyvan(`SELECT id FROM Attack_Card WHERE Name = N'${item.name}'`);
    }else{
      id_cards = await req.truyvan(`SELECT id FROM Defense_Card WHERE Name = N'${item.name}'`);
    }
    console.log(id_cards)
    item.id = id_cards[0].id ? id_cards[0].id : null;
  });
  await Promise.all(capnhat);
  console.log(updateCard);
    if(tendeck !== ''){
    const namedeck = await req.truyvan(`UPDATE Decks SET name = N'${tendeck}' WHERE id = ${iddeck};`);
    }
    const mota = await req.truyvan(`UPDATE Decks SET description = N'${motadeck}' WHERE id = ${iddeck};`);
    const dropDeck = await req.truyvan(`DELETE FROM Deck_Card WHERE deck_id = ${iddeck}`);
    const update = await updateCard.forEach(async item =>{
      const update = await req.truyvan(`INSERT INTO Deck_Card (deck_id, card_id, quantity, type) VALUES ('${iddeck}', '${item.id}', '${item.quantity}','${deck[0].addon}');`);
    });
    console.log(tendeck)
    return res.status(200).json({ message: 'Cập nhật thành công'});
  }catch(err){
    console.log(err);
    return res.status(400).json({ error: 'Lỗi hệ thống' });
  }
});

router.post('/xoa',async (req,res)=>{
  const { iddeck } = req.body;
  try{
    const status = await req.truyvan(`DELETE FROM Decks WHERE id = ${iddeck}`);
    return res.status(200).json({ message: 'Xóa thành công' });
  }catch{
    return res.status(400).json({ error: 'Lỗi hệ thống' });
  }
});

/* GET home page. */
router.get('/',async function(req, res, next) {
  const useridcheck = req.cookies['user'];
  const usernamecheck = req.cookies['username'];
  if (!useridcheck) {
    return res.redirect('/DangNhap')
  }
  const user = await req.truyvan(`SELECT * FROM Users WHERE username = '${usernamecheck}'`)
  const userid = user[0].id.toString()
  
  if(await !bcrypt.compare(userid,useridcheck)){
    return res.redirect('/DangNhap')
  } 
    var id_deck = req.query.id_deck
    console.log(id_deck)
    if(id_deck == undefined){
        return res.redirect('/DangNhap');
    }
    const user_deck = await req.truyvan(`SELECT * FROM Decks WHERE user_id = '${userid}' and id ='${id_deck}'`)
    console.log(user_deck)
  

  var card = [];
  var imageLinks = [];
  var card_in_deck = [];
  
  console.log(user_deck[0].addon)
  if(user_deck[0].addon == 'Attack'){
    card_in_deck = await req.truyvan(`SELECT Deck_Card.*,Attack_Card.Name FROM Deck_Card,Attack_Card WHERE Deck_Card.card_id = Attack_Card.id and deck_id = '${id_deck}' and Deck_card.type = '${user_deck[0].addon}'`)
    card = await req.truyvan(`SELECT User_Card.*,Attack_Card.* FROM User_Card,Attack_Card WHERE User_Card.id_card = Attack_Card.id and id_user = '${user[0].id}' and User_Card.addon = '${user_deck[0].addon}'`)
    imageLinks = req.imageLinksAT;
  }else if(user_deck[0].addon == 'Defense'){
    card_in_deck = await req.truyvan(`SELECT Deck_Card.*,Defense_Card.Name FROM Deck_Card,Defense_Card WHERE Deck_Card.card_id = Defense_Card.id and deck_id = '${id_deck}' and Deck_card.type = '${user_deck[0].addon}'`)
    card = await req.truyvan(`SELECT User_Card.*,Defense_Card.* FROM User_Card,Defense_Card WHERE User_Card.id_card = Defense_Card.id and id_user = '${user[0].id}' and User_Card.addon = '${user_deck[0].addon}'`)
    imageLinks = req.imageLinksDF;
  }
  console.log(imageLinks[0])

  const cards_user = card.map(item => {
    // Tìm đối tượng trong mảng image có tên ảnh tương ứng
    const imageDetails = imageLinks.find(img => img.name === item.Card_Link);
    
    // Kết hợp thông tin từ cả hai mảng
    return {
      ...item, // Thông tin từ mảng data
      Link: imageDetails ? imageDetails.link : null // Thông tin từ mảng image
    };
  });

  const cards_in_deck = card_in_deck.map(item => {
    // Tìm đối tượng trong mảng image có tên ảnh tương ứng
    const imageDetails = imageLinks.find(img => img.name === item.Card_Link);
    
    // Kết hợp thông tin từ cả hai mảng
    return {
      ...item, // Thông tin từ mảng data
      Link: imageDetails ? imageDetails.link : null // Thông tin từ mảng image
    };
  });
  // cards_user.forEach(card => {
  //   cards_in_deck.forEach(item => {if(item.id_card === card.id_card){
  //     if(card.quantity >= item.quantity){
  //       card.quantity = card.quantity - item.quantity;
  //       }
  //     }
  //   });
  //   return{
  //     ...card
  //   };
  // });
  console.log(cards_user[0])
  console.log(cards_in_deck[0])
  const iddeck = req.query.id_deck;
  const namedeck = user_deck[0].name;
  const motadeck = user_deck[0].description;
  const categories = [...new Set(cards_user.map(item => item['Type'] || ''))].filter(cat => cat !== '');
  res.render('Deck', { title: 'Express' , cards_user, cards_in_deck, iddeck ,namedeck,motadeck,categories });
});


module.exports = router;
