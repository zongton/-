const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件目录
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.redirect('/VIEW.html');
});

// --- 增强版路径处理 ---
// 优先尝试环境变量指定的目录，如果不给或者不可写，就退回到当前目录
let dbDir = process.env.DATABASE_DIR || path.join(__dirname, 'data');

try {
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    // 简单测试一下是否有写权限
    const testFile = path.join(dbDir, '.write_test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
} catch (err) {
    console.error(`⚠️ 警告: 目录 ${dbDir} 不可写，退回到本地目录!`, err.message);
    dbDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'docs_vault.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ 数据库开启失败:', err.message);
        process.exit(1); // 明确退出，方便看日志
    }
});
console.log(`🗄️ 数据库准备就绪: ${dbPath}`);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        category TEXT,
        status INTEGER DEFAULT 0,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// API 逻辑保持不变...
app.get('/api/docs/all', (req, res) => {
    db.all("SELECT * FROM docs ORDER BY update_time DESC", [], (err, rows) => {
        if(err) return res.json({code:500, msg: err.message});
        res.json({code:200, data: rows});
    });
});

app.post('/api/docs/save', (req, res) => {
    const { id, title, content, category, status } = req.body;
    if (id) {
        db.run("UPDATE docs SET title=?, content=?, category=?, status=?, update_time=CURRENT_TIMESTAMP WHERE id=?", 
        [title, content, category, status, id], (err) => {
            if(err) return res.json({code:500, msg: err.message});
            res.json({code:200, msg: "文档已更新"});
        });
    } else {
        db.run("INSERT INTO docs (title, content, category, status) VALUES (?, ?, ?, ?)", 
        [title, content, category, status || 0], function(err) {
            if(err) return res.json({code:500, msg: err.message});
            res.json({code:200, msg: "文档已发布", id: this.lastID});
        });
    }
});

app.post('/api/docs/delete', (req, res) => {
    db.run("DELETE FROM docs WHERE id = ?", [req.body.id], (err) => {
        if(err) return res.json({code:500, msg: err.message});
        res.json({code:200, msg: "文档已销毁"});
    });
});

const PORT = process.env.PORT || 7070;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📚 文档中心运行在: http://0.0.0.0:${PORT}`);
});
