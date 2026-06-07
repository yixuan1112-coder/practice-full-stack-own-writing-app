const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Windows 下部分路由器 DNS 会导致 Node 无法解析 mongodb+srv，改用公共 DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// 允许跨域（前端和后端即使不在同一个域名也能通信）
app.use(cors());
// 允许后端解析前端发来的 JSON 数据
app.use(express.json());
// 托管前端静态页面（public/index.html）
app.use(express.static(path.join(__dirname, 'public')));

// 1. 连接免费的 MongoDB 云数据库（这里替换成你自己的数据库连接字符串）
const MONGO_URI = "mongodb+srv://yixuan:Winner291547@cluster0.mrzocgp.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI)
  .then(() => console.log("云数据库连接成功！"))
  .catch(err => console.error("数据库连接失败:", err));

// 2. 定义数据结构（Schema）- 决定你在数据库里存什么
const MessageSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// 3. 路由 A：接收所有人输入的数据并保存
app.post('/api/messages', async (req, res) => {
  try {
    const newMessage = new Message({ content: req.body.content });
    await newMessage.save(); // 存入云端数据库
    res.status(200).json({ success: true, message: "数据已成功共享！" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. 路由 B：获取所有人的历史输入结果
app.get('/api/messages', async (req, res) => {
  try {
    // 找出所有数据，并按时间倒序排列（最新的在前面）
    const allMessages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(allMessages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器，监听 3000 端口
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已在 http://localhost:${PORT} 启动`);
});
