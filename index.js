const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const {resolve} = require("node:path");
const {get} = require("axios");
const bodyParser = require("express");
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
require("dotenv").config();


// init db
const sql3 = require("sqlite3").verbose();
const db = new sql3.Database(resolve(__dirname, "./test.sqlite"), sql3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err);
    }
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "https://whitenightawa.github.io"); // Replace with your actual origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials
    next(); // Pass control to the next middleware or route handler
});

const generateTokens = (user) => {
    const accessToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30d'});
    const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'});

    return {accessToken, refreshToken};
};

function insertData(data, table) {
    db.serialize(() => {

        const keys = Object.keys(data);
        const placeholders = keys.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${table} (${keys.join(', ')})
                           VALUES (${placeholders})`;
        const stmt = db.prepare(insertSQL);

        const values = keys.map(key => data[key] !== null ? data[key] : null);
        stmt.run(values);

        stmt.finalize();
    });
}


app.post('/login', async (req, res) => {
    const response = await get('https://www.googleapis.com/oauth2/v3/userinfo',
        {headers: {Authorization: `Bearer ${req.body.access_token}`}},
    );
    if (response.status !== 200) res.send(response);
    const userdata = response.data;
    console.log(userdata);
    db.get(`SELECT count(*)
            FROM users
            WHERE id = '${userdata.sub}'`, (err, rows) => {
        if (err) res.send(err);

        const ud = {
            id: userdata.sub,
            username: userdata.name,
            avatar: userdata.picture,
            email: userdata.email,
        };
        if (rows["'count(*)'"] === 0) {
            // register
            insertData(ud, "users");
        }
        const tokens = generateTokens(ud);
        db.run(`INSERT INTO rt (rt)
                VALUES ('${tokens.refreshToken}')`);
        res.cookie("_hkrgm_at", tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 1d
        }).json(ud);
    });
});


const authenticateToken = (req, res, next) => {
    const token = req.cookies._hkrgm_at;
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};


// Protected route
app.get('/user/info', authenticateToken, (req, res) => {
    db.get(`SELECT *
            FROM users
            WHERE id = '${req.user.id}'`, (err, rows) => {
        if (err) res.send(err);
        res.json(rows);
    })
});

app.get("/comment/check/:id", authenticateToken, (req, res) => {
    db.get(`SELECT *
            FROM ratings
            WHERE targetId = ?
              AND userid = ?`, [req.params.id, req.user.id], (err, rows) => {
        if (err) return res.sendStatus(400);
        return rows ? res.status(200).json(rows) : res.sendStatus(400);
    });
});
app.post("/comment/summit/:id", authenticateToken, (req, res) => {
    db.get(`SELECT *
            FROM ratings
            WHERE targetId = ?
              AND userid = ?`, [req.params.id, req.user.id], (err, rows) => {
        if (err) return res.status(400).send(err);
        if (!rows) {
            // new
            insertData({...req.body, userid: req.user.id, targetId: req.params.id}, "ratings");
            return res.sendStatus(200);
        } else {
            db.run("UPDATE ratings SET (rating, smoke, people, comments) = (?, ?, ?, ?) WHERE targetId = ? AND userid = ?",
                [...Object.values(req.body), req.params.id, req.user.id],
                (err) => {
                    if (err) return res.status(400).send(err);
                    return res.sendStatus(200);
                })
        }
    });

});


// Sample route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/places/all', (req, res) => {
    db.all("SELECT * FROM places", (err, rows) => {
        if (err) res.error(err);
        res.setHeader("Access-Control-Allow-Origin", "").json(rows);
    });
});

app.get('/places/:id', (req, res) => {
    const {id} = req.params;
    db.get(`SELECT *
            FROM places
            WHERE id = '${id}'`, (err, rows) => {
        if (err) res.error(err);
        res.json(rows);
    });
})

app.get("/comments/:id", (req, res) => {
    const {id} = req.params;
    db.all(`SELECT ratings.*, users.username, users.avatar
            FROM ratings
                     JOIN users ON ratings.userid = users.id
            WHERE ratings.targetId = '${id}'`, (err, rows) => {
        if (err) res.error(err);
        res.json(rows);
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});