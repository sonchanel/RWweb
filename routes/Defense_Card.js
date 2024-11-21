const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');

// Đường dẫn đến file JSON chứa thông tin xác thực
// const KEYFILEPATH = path.join(__dirname, '../rival-war-bd12481a6de2.json');
// const SHEET_ID = '1bZxqPqHdWa7DOs0LxvIc1gXQ1ILv-fHmbemXWKL0Yro';
// const RANGE = 'Card Attack!A:K';

// Cấu hình Google Sheets API
// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
// });

// const sheets = google.sheets({ version: 'v4', auth });

//DropBox
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch'); // Dropbox SDK yêu cầu node-fetch nếu sử dụng Node.js


// Route để hiển thị dữ liệu từ Google Sheets
router.get('/', async (req, res, next) => {

  const data = await req.truyvan('SELECT * FROM Defense_Card')
  const header = await req.truyvan("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Defense_Card'")
  const headers = header.map(row => row.COLUMN_NAME);

  const imageLinks = req.imageLinksDF;
  // const dbxPath = req.dbxPath;
  // const dbx = new Dropbox({ accessToken: dbxPath, fetch: fetch });
  // const imageLinks = [];
  // try {
  //   // Lấy danh sách các tệp từ Dropbox
  //   const response = await dbx.filesListFolder({ path: '/Card/Defense' });
  //   const files = response.result.entries;
    
  //   // Tạo biến để lưu các liên kết hình ảnh
    

  //   if (Array.isArray(files)) {
  //     // Sắp xếp các tệp theo tên
  //     files.sort((a, b) => a.name.localeCompare(b.name));
      

  //     // Tạo liên kết tạm thời cho từng ảnh
  //     const promises = files.map(file => {
  //       if (file['.tag'] === 'file') {
  //         return dbx.filesGetTemporaryLink({ path: file.path_lower })
  //           .then(tempLinkResponse => {
  //             imageLinks.push({ name: file.name, link: tempLinkResponse.result.link }); // Lưu liên kết và tên vào biến
  //           })
  //           .catch(error => {
  //             console.error('Error getting temp link:', error);
  //           });
  //       } else {
  //         //console.log(`Skipping non-file entry: ${file.name}`);
  //         return Promise.resolve(); // Trả về promise để tiếp tục xử lý
  //       }
  //     });

  //     // Chờ tất cả các promises hoàn thành
  //     await Promise.all(promises);

  //     // Sắp xếp lại các liên kết hình ảnh (nếu cần) theo tên hoặc bất kỳ tiêu chí nào khác
  //     imageLinks.sort((a, b) => a.name.localeCompare(b.name));

  //     // Xây dựng HTML với các hình ảnh
  //   } else {
  //     res.send('No images found.');
  //   }
  // } catch (error) {
  //   console.error('Error:', error);
  //   res.status(500).send('Error fetching files from Dropbox');
  // }


  // const response = await dbx.filesListFolder({ path: '/Card/Attack' });
  //   const files = response.result.entries;
    
  //   // Tạo biến để lưu các liên kết hình ảnh
  //   const imageLinks = [];
  //   files.sort((a, b) => {
  //     if (a.name < b.name) return -1;
  //     if (a.name > b.name) return 1;
  //     return 0;
  //   });
  //   console.log(files)
  //   if (Array.isArray(files)) {
  //     // Tạo liên kết tạm thời cho từng ảnh
  //     const promises = files.map(file => {
  //       if (file['.tag'] === 'file') {
  //         return dbx.filesGetTemporaryLink({ path: file.path_lower })
  //           .then(tempLinkResponse => {
  //             imageLinks.push(tempLinkResponse.result.link); // Lưu liên kết vào biến
  //           })
  //           .catch(error => {
  //             console.error('Error getting temp link:', error);
  //           });
  //       } else {
  //         console.log(`Skipping non-file entry: ${file.name}`);
  //         return Promise.resolve(); // Trả về promise để tiếp tục xử lý
  //       }
  //     });

  //     // Chờ tất cả các promises hoàn thành
  //     await Promise.all(promises);
  //     console.log(imageLinks)
  //   }

    const KEYFILEPATH = req.KEYFILEPATH;
    const SHEET_ID = req.SHEET_ID;
    const RANGE = 'Card Defense!A:L';;

    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });

    try {
      // const response = await sheets.spreadsheets.values.get({
      //   spreadsheetId: SHEET_ID,
      //   range: RANGE,
      // });
      // const rows = response.data.values;
      // const headers = rows[0];


      
      //   // Tạo mảng chứa tên và đường dẫn ảnh
      //   const data = rows.slice(1).filter(row => row[headers.indexOf('Name')] && row.length > 0).map((row, index) => {
      //       let item = {};
      //       headers.forEach((header, headerIndex) => {
      //         item[header] = row[headerIndex];
      //       });
      //       // Tự sinh số thứ tự dựa trên vị trí của hàng
      //       const number = String(index + 1).padStart(3, '0'); // Sinh số thứ tự và định dạng với ba chữ số
      //       item['Stt'] = number;
      //       // Thêm đường dẫn ảnh vào dữ liệu nếu số thứ tự hợp lệ
      //       item['Image'] = number ? `project_${number}.png` : null;
      //       return item;
      //     });
  
              // Lấy danh sách các thể loại
            const categories = [...new Set(data.map(item => item['Type'] || ''))].filter(cat => cat !== '');
            //console.log('Categories:', categories);

      const dulieu = data.map(item => {
        // Tìm đối tượng trong mảng image có tên ảnh tương ứng
        const imageDetails = imageLinks.find(img => img.name === item.Card_Link);
        
        // Kết hợp thông tin từ cả hai mảng
        return {
          ...item, // Thông tin từ mảng data
          Link: imageDetails ? imageDetails.link : null // Thông tin từ mảng image
        };
      });
      console.log(dulieu[176])
      res.render('Defense_Card', { dulieu, headers, categories });
    } catch (error) {
      console.error('Error retrieving data from Sheets:', error);
      next(error);
    }
  });

module.exports = router;
