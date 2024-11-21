const { google } = require('googleapis');
const sql = require('mssql');

// Hàm lấy dữ liệu từ Google Sheets
async function getSheetData(auth) {
  const sheets = google.sheets('v4');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1bZxqPqHdWa7DOs0LxvIc1gXQ1ILv-fHmbemXWKL0Yro',
    range: 'Card Defense!A3:K',
    auth,
  });
  return res.data.values;
}

// Hàm thêm dữ liệu vào MSSQL
async function insertDataToMSSQL(data) {
  const pool = await sql.connect({
    user: 'admin',
    password: 'admin',
    server: 'DESKTOP-0V6KROC',
    database: 'RWCard',
    options: {
        encrypt: true, // Đảm bảo là true nếu sử dụng TLS/SSL
        trustServerCertificate: true // Bỏ qua xác minh chứng chỉ
      }
  });
  
  
  for (const row of data) {
    const request = pool.request();
    // Thay đổi câu lệnh INSERT INTO theo cấu trúc bảng của bạn
    request.input('param1', sql.NVarChar, row[0]);
    request.input('param2', sql.Int, row[1]);
    request.input('param3', sql.NVarChar, row[2]);
    request.input('param4', sql.NVarChar, row[3]);
    request.input('param5', sql.NVarChar, row[4]);
    request.input('param6', sql.NVarChar, row[5]);
    request.input('param7', sql.NVarChar, row[6]);
    request.input('param8', sql.NVarChar, row[7]);
    request.input('param9', sql.NVarChar, row[8]);
    request.input('param10', sql.NVarChar, row[9]);
    request.input('param11', sql.NVarChar, row[10]);
    try {
        await request.query(`
          INSERT INTO Defense_Card (Name,Cost,Properties,Image,Attribute,Description,Heath,Strengh,Type,Rarity,Card_Link)
          VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11)
        `);
      } catch (err) {
        console.error(err);
      }
    }
  }
  

//   data.forEach(row => {
//     // Thay đổi câu lệnh INSERT INTO theo cấu trúc bảng của bạn
//     request.query(`
//       INSERT INTO Attack_Card (Name,Cost,Properties,Image,Attribute,Description,Heath,Strengh,Type,Rarity,Card_Link)
//       VALUES ('${row[0]}','${row[1]}','${row[2]}','${row[3]}','${row[4]}','${row[5]}','${row[6]}','${row[7]}','${row[8]}','${row[9]}','${row[10]}')
//     `).catch(err => console.error(err));
//   });

//   await pool.request().bulk(table);
// }

// Hàm chính
async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'rival-war-bd12481a6de2.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
  });

  const data = await getSheetData(await auth.getClient());
  await insertDataToMSSQL(data);
}

main().catch(console.error);
