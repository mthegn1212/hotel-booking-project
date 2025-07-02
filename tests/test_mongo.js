const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('🛠️ Đang kiểm tra biến môi trường...');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Chưa được định nghĩa');

if (!process.env.MONGODB_URI) {
  console.error('LỖI: Không tìm thấy MONGODB_URI trong .env');
  console.log('Hãy đảm bảo file .env nằm ở thư mục gốc project');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('KẾT NỐI MONGODB THÀNH CÔNG!');
  process.exit(0);
})
.catch(err => {
  console.error('LỖI KẾT NỐI:', err.message);
  console.log('\nKIỂM TRA:');
  console.log('1. MongoDB có đang chạy? (net start MongoDB)');
  console.log('2. Đúng cổng 27017? (netstat -ano | findstr 27017)');
  console.log('3. Firewall có chặn kết nối?');
  process.exit(1);
});