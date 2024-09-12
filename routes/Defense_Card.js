const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');

// Đường dẫn đến file JSON chứa thông tin xác thực
const KEYFILEPATH = path.join(__dirname, '../rival-war-a49295d4d376.json');
const SHEET_ID = '1bZxqPqHdWa7DOs0LxvIc1gXQ1ILv-fHmbemXWKL0Yro';
const RANGE = 'Card Defense!A:K';

// Cấu hình Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Route để hiển thị dữ liệu từ Google Sheets
router.get('/', async (req, res, next) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      });
      const rows = response.data.values;
      const headers = rows[0];


      
        // Tạo mảng chứa tên và đường dẫn ảnh
        const data = rows.slice(1).filter(row => row[headers.indexOf('Name')] && row.length > 0).map((row, index) => {
            let item = {};
            headers.forEach((header, headerIndex) => {
              item[header] = row[headerIndex];
            });
            // Tự sinh số thứ tự dựa trên vị trí của hàng
            const number = String(index + 1).padStart(3, '0'); // Sinh số thứ tự và định dạng với ba chữ số
            item['Stt'] = number;
            // Thêm đường dẫn ảnh vào dữ liệu nếu số thứ tự hợp lệ
            item['Image'] = number ? `project_${number}.png` : null;
            return item;
          });
  
              // Lấy danh sách các thể loại
            const categories = [...new Set(data.map(item => item['Type'] || ''))].filter(cat => cat !== '');
            console.log('Categories:', categories);

      res.render('Defense_Card', { data, headers, categories });
    } catch (error) {
      console.error('Error retrieving data from Sheets:', error);
      next(error);
    }
  });

module.exports = router;
