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

// --- 修复后的默认跳转逻辑 ---
app.get('/', (req, res) => {
    res.redirect('/VIEW.html');
});

// 独享数据库
const db = new sqlite3.Database(path.join(__dirname, 'docs_vault.db'));

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

const PORT = 7070;
app.listen(PORT, () => console.log(`📚 文档中心运行在: http://localhost:${PORT}`));
