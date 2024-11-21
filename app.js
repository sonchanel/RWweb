var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { google } = require('googleapis');
const fs = require('fs');
const sql = require('mssql');
const { sqlquerry }  = require('./server');
const bodyParser = require('body-parser');

const { Dropbox } = require('dropbox');
const fetch = require('node-fetch'); 


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var usersMove = require('./routes/move');
var AttackRouter = require('./routes/Attack_Card');
var DefenseRouter = require('./routes/Defense_Card');
var LoginRouter = require('./routes/DangNhap');
var TaiKhoanRouter = require('./routes/TaiKhoan');
var DeckRouter = require('./routes/Deck');
var ThanhToanRouter = require('./routes/ThanhToan');
var AboutRouter = require('./routes/About');
var ContactRouter = require('./routes/Contact');
var NewsRouter = require('./routes/News');
var H2PRouter = require('./routes/H2P');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  user: 'admin',
  password: 'admin',
  server: 'DESKTOP-0V6KROC',
  database: 'RWCard',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const caulenh = async function run(truyvan) {
  try {
    const query = truyvan; // Thay đổi thành câu lệnh SQL của bạn
    const results = await sqlquerry(query);
    return results; // Kết quả của truy vấn sẽ được in ra ở đây
  } catch (err) {
    console.error('Error running query:', err);
  }
}


var DropboxToken = 'sl.B-I_Lb4J2OeSiHhzf8SONGbRFCo2zwDs7o2vvEOXZcaskuVInmffl236pgzUNrQ9wOufwy9ragtvuCHm95kn_lzX2dI1Xte3eD4WzBHEnd5sdd_CnjJtCTJ0u1d2T8CAlD_YkmGqDM43CvtB7-5T7Wg';
const axios = require('axios');
const qs = require('qs'); // Cần thiết để mã hóa params

//Thông tin ứng dụng và refresh token
const refreshToken = 'bawgrKXOcskAAAAAAAAAAfdExsTaUXDeRy-QcZmCEU7mi7oRUPY33PR4u9eM30eo';
const clientId = '9qr82u2ectei8p5';
const clientSecret = 'xlbbdku5rx6wb0w';

async function Attack(){
  const imageLinksAT = []; 
  const dbxPath = DropboxToken;
  const dbx = new Dropbox({ accessToken: dbxPath, fetch: fetch });
  let files;

  async function fetchDropboxLink() {
    try {
    // Lấy danh sách các tệp từ Dropbox
    const response = await dbx.filesListFolder({ path: '/Card/Attack' });
    files = await response.result.entries;
  }catch (error) {
    if (error.status === 429) {
        const retryAfter = 3; // Giả định 5 phút
        console.log(`Quá nhiều yêu cầu, vui lòng chờ ${retryAfter} giây trước khi thử lại.`);
        // Dùng setTimeout để chờ trước khi thử lại
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(fetchDropboxLink()); // Thử lại sau khi chờ
            }, retryAfter * 1000);
        });
    } else {
        console.error('Lỗi:', error);
    }
  }
  }
  await fetchDropboxLink();
    // Tạo biến để lưu các liên kết hình ảnh
    try{

    if (Array.isArray(files)) {
      // Sắp xếp các tệp theo tên
      files.sort((a, b) => a.name.localeCompare(b.name));
      

      // Tạo liên kết tạm thời cho từng ảnh
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const promises = files.map((file, index) => {
  return delay(index * 100) // Thêm độ trễ 100ms giữa các request
    .then(() => {
      if (file['.tag'] === 'file') {
        return dbx.filesGetTemporaryLink({ path: file.path_lower })
          .then(tempLinkResponse => {
            imageLinksAT.push({ name: file.name, link: tempLinkResponse.result.link });
          })
          .catch(error => {
            console.error('Error getting temp link:', error);
          });
      } else {
        console.log(`Skipping non-file entry: ${file.name}`);
        return Promise.resolve();
      }
    });
});

// Chờ cho tất cả các promise hoàn thành
Promise.all(promises)
  .then(() => {
    console.log('All links fetched successfully');
  })
  .catch(error => {
    console.error('Error fetching links:', error);
  });


      // Sắp xếp lại các liên kết hình ảnh (nếu cần) theo tên hoặc bất kỳ tiêu chí nào khác
      imageLinksAT.sort((a, b) => a.name.localeCompare(b.name));

      // Xây dựng HTML với các hình ảnh
    } else {
      console.log('No images found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return imageLinksAT
}
async function Defense(){ 
  const imageLinksDF = [];
  const dbxPath = DropboxToken;
  const dbx = new Dropbox({ accessToken: dbxPath, fetch: fetch });
  let files;

  async function fetchDropboxLink() {  
    try {
    // Lấy danh sách các tệp từ Dropbox
    const response = await dbx.filesListFolder({ path: '/Card/Defense' });
    files = await response.result.entries;
  }catch (error) {
    if (error.status === 429) {
        const retryAfter = 3; // Giả định 5 phút
        console.log(`Quá nhiều yêu cầu, vui lòng chờ ${retryAfter} giây trước khi thử lại.`);
        // Dùng setTimeout để chờ trước khi thử lại
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(fetchDropboxLink()); // Thử lại sau khi chờ
            }, retryAfter * 1000);
        });
    } else {
        console.error('Lỗi:', error);
    }
  }
  }
  await fetchDropboxLink();
    // Tạo biến để lưu các liên kết hình ảnh
    try{
    
    // Tạo biến để lưu các liên kết hình ảnh
    

    if (Array.isArray(files)) {
      // Sắp xếp các tệp theo tên
      files.sort((a, b) => a.name.localeCompare(b.name));
      

      // Tạo liên kết tạm thời cho từng ảnh
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const promises = files.map((file, index) => {
  return delay(index * 100) // Thêm độ trễ 100ms giữa các request
    .then(() => {
      if (file['.tag'] === 'file') {
        return dbx.filesGetTemporaryLink({ path: file.path_lower })
          .then(tempLinkResponse => {
            imageLinksDF.push({ name: file.name, link: tempLinkResponse.result.link });
          })
          .catch(error => {
            console.error('Error getting temp link:', error);
          });
      } else {
        console.log(`Skipping non-file entry: ${file.name}`);
        return Promise.resolve();
      }
    });
});

// Chờ cho tất cả các promise hoàn thành
Promise.all(promises)
  .then(() => {
    console.log('All links fetched successfully');
  })
  .catch(error => {
    console.error('Error fetching links:', error);
  });


      // Sắp xếp lại các liên kết hình ảnh (nếu cần) theo tên hoặc bất kỳ tiêu chí nào khác
      imageLinksDF.sort((a, b) => a.name.localeCompare(b.name));

      // Xây dựng HTML với các hình ảnh
    } else {
      console.log('No images found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return imageLinksDF
}
const imageLinksAT = Attack();
const imageLinksDF = Defense();

// // Hàm lấy access token từ Dropbox
// async function getAccessToken() {
//   try {
//     const response = await axios.post('https://api.dropboxapi.com/oauth2/token',
//       qs.stringify({
//         grant_type: 'refresh_token',
//         refresh_token: refreshToken
//       }),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
//         }
//       }
//     );

//     // Nhận access token từ phản hồi của Dropbox API
//     const { access_token } = response.data;
//     console.log('Access Token:', access_token);

//     // Trả về access token để dùng cho các API khác
//     return access_token;

//   } catch (error) {
//     console.error('Error fetching access token:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// }

// // Gọi hàm để lấy Access Token
// DropboxToken = getAccessToken();




//Google sheet
const KEYFILEPATH = path.join(__dirname, 'rival-war-bd12481a6de2.json');
const SHEET_ID = '1bZxqPqHdWa7DOs0LxvIc1gXQ1ILv-fHmbemXWKL0Yro';
//const RANGE = 'Card Attack!A:L';
 //= 'sl.B81fpZ1n0AS_hBwXqEa4dn1F5F3Wp7VvvFnv9qj78NYunLA6PEL9aiCK6_WL3S0olxeddm-S1O5IsrpgpNYVdsg7id1SZ3gzgQbCYMu0X1megiWuH3wEJOuAPqNpxPdFRA5Rwpy6gTYrB8mhg3JJNLI'

// Cấu hình Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });


const url = 'https://api.dropboxapi.com/oauth2/token';
const params = new URLSearchParams({
  code: '8lmF59svo_sAAAAAAAAA3S93cg0UdYIA9IiGZTz7Bkw',
  grant_type: 'authorization_code',
  client_id: '9qr82u2ectei8p5',
  client_secret: 'xlbbdku5rx6wb0w',
});

const refeshToken = 'bawgrKXOcskAAAAAAAAAAfdExsTaUXDeRy-QcZmCEU7mi7oRUPY33PR4u9eM30eo'





// const accessToken = DropboxToken

// async function listFiles() {
//   console.log("a")
//   try {
//     const response = await axios({
//       method: 'post',
//       url: 'https://api.dropboxapi.com/2/files/list_folder',
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       },
//       data: {
//         path: '/Card/Defense' // Đường dẫn tới thư mục, để trống để lấy danh sách thư mục gốc
//       }
//     });

//     console.log('--------------------Files:', response.data.entries);
//   } catch (error) {
//     console.error('Error fetching files from Dropbox:', error.response ? error.response.data : error.message);
//   }
// }

// listFiles();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/move', usersMove);
app.use('/About',AboutRouter);
app.use('/Contact',ContactRouter);
app.use('/News',NewsRouter);
app.use('/H2P',H2PRouter);
app.use(async (req, res, next) => {
  req.KEYFILEPATH = KEYFILEPATH;
  req.SHEET_ID = SHEET_ID;
  //req.RANGE = RANGE;
  req.imageLinksAT = await imageLinksAT;
  req.imageLinksDF = await imageLinksDF;
  req.config = config;
  req.truyvan = caulenh;
  next();
});
app.use('/Attack_Card', AttackRouter);
app.use('/Defense_Card', DefenseRouter);
app.use('/DangNhap', LoginRouter);
app.use('/TaiKhoan', TaiKhoanRouter);
app.use('/TaiKhoan/Deck', DeckRouter);
app.use('/ThanhToan',ThanhToanRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
