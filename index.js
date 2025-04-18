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
const {Database} = require('@sqlitecloud/drivers');


// init db
const db = new Database(process.env.DATABASE_URL);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
    origin: [
        (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "http://localhost:5174" : "https://whitenightawa.github.io"
    ],
    optionsSuccessStatus: 200,
    credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use((err, req, res, next) => {
    console.error('An error occurred:', err);
    res.status(500).json({error: 'Internal server error'});
});


const generateTokens = (user) => {
    const accessToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30d'});
    const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'});

    return {accessToken, refreshToken};
};

function insertData(data, table, update = null) {

    const keys = Object.keys(data);
    const placeholders = keys.map(k => '?').join(', ');
    const insertSQL = update !== null
        ? `Update ${table}
           SET (${keys.join(', ')}) = (${placeholders})
           WHERE ${update}`
        : `INSERT INTO ${table} (${keys.join(', ')})
           VALUES (${placeholders})`;

    const values = keys.map(key => data[key] !== null ? data[key] : null);

    console.log(insertSQL, values);
    db.prepare(insertSQL).bind(...values).run();
}

const authenticateToken = (req, res, next) => {
    const token = req.cookies._hkrgm_at;
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

app.post('/login', async (req, res) => {
    const response = await get('https://www.googleapis.com/oauth2/v3/userinfo',
        {headers: {Authorization: `Bearer ${req.body.access_token}`}},
    );
    if (response.status !== 200) res.send(response);
    const userdata = response.data;
    console.log(userdata);
    db.get(`SELECT count(*) as c
            FROM users
            WHERE id = '${userdata.sub}'`, (err, rows) => {
        if (err) res.send(err);
        console.log(rows.c);

        const ud = {
            id: userdata.sub,
            username: userdata.name,
            avatar: userdata.picture,
            email: userdata.email,
        };
        if (rows["c"] === 0) {
            console.log("registering");
            insertData(ud, "users");
        }
        const tokens = generateTokens(ud);
        res.cookie("_hkrgm_at", tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 1d
        }).json(ud);
    });
});
app.post("/logout", authenticateToken, (req, res) => {
    res.clearCookie("_hkrgm_at").sendStatus(200);
})


app.get("/anns", async (req, res) => {
    db.all(`SELECT *, DATETIME(time, 'localtime', '+8 hours') as time
            FROM anns`, (err, rows) => {
        if (err) res.status(400).send(err);
        res.json(rows);
    })
});


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
    console.log(req.params.id, req.user.id)
    db.get(`SELECT *, DATETIME(time, 'localtime', '+8 hours') as time
            FROM ratings
            WHERE targetId = '${req.params.id}'
              AND userid = '${req.user.id}';`, (err, rows) => {
        if (err) return res.sendStatus(400);
        return rows ? res.status(200).json(rows) : res.sendStatus(400);
    });
});

app.post("/comment/summit/:id", authenticateToken, (req, res) => {
    db.get(`SELECT *
            FROM ratings
            WHERE targetId = '${req.params.id}'
              AND userid = '${req.user.id}';`, (err, rows) => {
        if (err) return res.status(400).send(err);
        if (!rows) {
            // new
            insertData({...req.body, userid: req.user.id, targetId: req.params.id}, "ratings");
            return res.sendStatus(200);
        } else {
            const {rating, smoke, people, comments} = req.body;
            db.run(`UPDATE ratings
                    SET (rating, smoke, people, comments) = ('${rating}', '${smoke}', '${people}', '${comments}')
                    WHERE targetId = '${req.params.id}'
                      AND userid = '${req.user.id}';`,
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
        if (err) res.status(503).json(err);
        res.json(rows);
    });
});

app.get('/places/:id', (req, res) => {
    const {id} = req.params;
    db.get(`SELECT *, DATETIME(last_edit, 'localtime', '+8 hours') as last_edit
            FROM places
            WHERE id = '${id}';`, (err, rows) => {
        if (err) res.status(503).json(err);
        res.json(rows);
    });
})

app.post("/places/update/:id", (req, res) => {
    const {id} = req.params;
    const {data} = req.body;
    const authHeader = req.headers.authorization;

    if (!data) return res.sendStatus(400);

    if (!authHeader.startsWith("Bearer ")) return res.sendStatus(401);
    const token = authHeader.substring(7, authHeader.length);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401); // Forbidden

        insertData(data, "places", `id = '${id}'`)
        return res.sendStatus(200);
    });
});

app.get("/comments/:id", (req, res) => {
    const {id} = req.params;
    db.all(`SELECT ratings.*, users.username, users.avatar
            FROM ratings
                     JOIN users ON ratings.userid = users.id
            WHERE ratings.targetId = '${id}'`, (err, rows) => {
        if (err) res.status(503).json(err);
        res.json(rows);
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});