var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

router.post('/submit',async (req,res)=>{
    try{
    const { id_pack } = req.body;
    const useridcheck = req.cookies['user'];
    const usernamecheck = req.cookies['username'];
    if (!useridcheck || !usernamecheck) {
        return res.status(400).send({ error: "Lỗi hệ thống" });
    }
    const user = await req.truyvan(`SELECT * FROM Users WHERE username = '${usernamecheck}'`)
    const userid = user[0].id.toString()
    const username = user[0].username
    if(await !bcrypt.compare(userid,useridcheck)){
        return res.status(400).send({ error: "Lỗi hệ thống" });
    } 
    const pack = await req.truyvan(`SELECT * FROM Shop WHERE id = '${id_pack}'`)
    let cards = [];
    let card_link = [];
    //ADD CARD
    const link_card_attack = req.imageLinksAT;
    const link_card_defednse = req.imageLinksDF;
    if(pack[0].Addon == "Attack"){
        cards = await req.truyvan(`SELECT * FROM Attack_Card`)
        card_link = cards.map(card => {
            const correspondingLink = link_card_attack.find(link => link.name === card.Card_Link);
            return {
            ...card, // Giữ lại tất cả các trường của user
            link: correspondingLink ? correspondingLink.link : null // Thêm trường link nếu tìm thấy
            };
        });    
    }else if(pack[0].Addon == "Defense"){
        cards = await req.truyvan(`SELECT * FROM Defense_Card`)
        card_link = cards.map(card => {
            const correspondingLink = link_card_defednse.find(link => link.name === card.Card_Link);
            return {
            ...card, // Giữ lại tất cả các trường của user
            link: correspondingLink ? correspondingLink.link : null // Thêm trường link nếu tìm thấy
            };
        });
    }
    console.log(cards[0])
    function gacha(cards, numberOfCards) {
        const weightedCards = [];
    
        // Tạo mảng weightedCards dựa trên độ hiếm
        cards.forEach(card => {
            let num;
            switch (card.Rarity) {
                case 'Basic':
                    num = 10
                    break;
                case 'Rare':
                    num = 5
                    break;
                case 'Supper Rare':
                    num = 3
                    break;
                case 'Legendary':
                    num = 1
                    break;
                default:
                    num = 0
            }            
            for (let i = 0; i < num; i++) {
                weightedCards.push(card);
            }
        });
    
        const selectedCards = [];
    
        // Chọn ngẫu nhiên các card
        for (let i = 0; i < numberOfCards; i++) {
            const randomIndex = Math.floor(Math.random() * weightedCards.length);
            selectedCards.push(weightedCards[randomIndex]);
        }
    
        return selectedCards;
    }
    
    // Sử dụng hàm gacha để lấy 6 card
    const gachaCards = gacha(card_link, 6*pack[0].Quantity);
    console.log(gachaCards[0])
    for (let i = 0; i < gachaCards.length; i++) {
        const checkcard = await req.truyvan(`SELECT * FROM User_Card WHERE id_card = '${gachaCards[i].id}' and addon = '${pack[0].Addon}'`);
        console.log("Do dai "+checkcard.length)
        console.log("id "+gachaCards[i].id + " " + gachaCards[i].Name)
        if(checkcard.length > 0){
            const addcard = await req.truyvan(`UPDATE User_Card SET quantity = quantity + 1 WHERE id_card = '${gachaCards[i].id}' and addon = '${pack[0].Addon}';`)
        }else{
            const gencard = await req.truyvan(`INSERT INTO User_Card (id_user, id_card, quantity, addon) VALUES ('${userid}', '${gachaCards[i].id}', 1, '${pack[0].Addon}');`)
        }
    }
    return res.status(200).send({ cards: gachaCards });
    }catch{
        return res.status(400).send({ error: "Lỗi hệ thống" });
    }
    
});

/* GET home page. */
router.get('/', async function(req, res, next) {
    const id_pack = req.query.id;
    if(!id_pack){
        return res.redirect('/DangNhap')
    }
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

    const pack = await req.truyvan(`SELECT * FROM Shop WHERE id = '${id_pack}'`)
    if(pack.length == 0){
        return res.redirect('/DangNhap');
    }


  res.render('ThanhToan', { title: 'Express' , id_pack, pack  });
});


module.exports = router;
