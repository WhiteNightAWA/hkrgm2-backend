const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors'); // Import CORS

// init db
const sql3 = require("sqlite3").verbose();
const db = new sql3.Database("./test.sqlite", sql3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err);
    }
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Sample route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/places/all', (req, res) => {
    db.all("SELECT * FROM places", (err, rows) => {
        if (err) res.error(err);
        res.json(rows);
    });
});

app.get('/places/:id', (req, res) => {
    const {id} = req.params;
    db.get(`SELECT * FROM places WHERE id = '${id}'`, (err, rows) => {
        if (err) res.error(err);
        res.json(rows);
    });
})

app.get("/comments/:id", (req, res) => {
    const {id} = req.params;
    db.all(`SELECT ratings.*, users.username, users.avatar FROM ratings JOIN users ON ratings.userid = users.id WHERE ratings.targetId = '${id}'`, (err, rows) => {
        if (err) res.error(err);
        res.json(rows);
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});