
const sql = require('mssql');

const port = 3000;

// Cấu hình kết nối
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
async function sqlquerry(query) {
  try {
    // Kết nối đến cơ sở dữ liệu
    const pool = await sql.connect(config);
    
    // Thực hiện truy vấn
    const result = await pool.request().query(query);
    
    // Trả về kết quả truy vấn
    return result.recordset;
  } catch (err) {
    console.error('SQL Query Error:', err);
    throw err; // Ném lỗi để có thể xử lý ở nơi gọi hàm
  }
}

module.exports = {
  sqlquerry
};
