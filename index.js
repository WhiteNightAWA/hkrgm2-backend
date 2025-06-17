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
const {isJson} = require("./function");


// init db
const db = new Database(process.env.DATABASE_URL);

// Require the cloudinary library
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    secure: true
});

// Middleware to parse JSON bodies
app.use(express.json({limit: '50mb'}));
app.use(cors({
    origin: [(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "http://localhost:5173" : "https://whitenightawa.github.io"],
    optionsSuccessStatus: 200,
    credentials: true,
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());


const generateTokens = (user) => {
    const accessToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30d'});
    const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'});

    return {accessToken, refreshToken};
};

function updateDatabase(data, table) {
    try {
        delete data.distance;
        const values = Object.entries(data).map(([key, value]) => `'${key}' = '${isJson(value) ? JSON.stringify(value) : value}'`).join(', ');
        const cmd = `UPDATE ${table} SET ${values} WHERE id = '${data.id}';`;
        console.log(cmd);
        db.run(cmd);
        return true
    } catch (err) {
        console.error(err);
        return false;
    }
}

function insertData(data, table) {
    const keys = Object.keys(data);
    const placeholders = keys.map(_ => '?').join(', ');
    const id = data.id;

    const insertSQL =  `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;


    const values = keys.map(key => data[key] !== null ? data[key] : null);

    db.prepare(insertSQL).bind(...values).run();
}


app.post('/login', async (req, res) => {
    const response = await get('https://www.googleapis.com/oauth2/v3/userinfo',
        {headers: {Authorization: `Bearer ${req.body.access_token}`}},
    );
    if (response.status !== 200) res.send(response);
    const userdata = response.data;
    db.get(`SELECT count(*) as c
            FROM users
            WHERE id = '${userdata.sub}'`, (err, rows) => {
        if (err) res.send(err);

        const ud = {
            id: userdata.sub,
            username: userdata.name,
            avatar: userdata.picture,
            email: userdata.email,
        };
        if (rows["c"] === 0) {
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
        db.get(`SELECT * FROM users WHERE id = "${user.id}"`, (err, rows) => {
            req.user = rows;
            next();
        });
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

app.get("/comments/check/:id", authenticateToken, (req, res) => {
    db.get(`SELECT *
            FROM comments
            WHERE targetId = '${req.params.id}'
              AND userid = '${req.user.id}';`, (err, rows) => {
        if (err) return res.sendStatus(400);
        return rows ? res.status(200).json(rows) : res.sendStatus(400);
    });
});

app.post("/comments/summit/:id", authenticateToken, (req, res) => {
    db.get(`SELECT *
            FROM comments
            WHERE targetId = '${req.params.id}'
              AND userid = '${req.user.id}';`, async (err, rows) => {
        if (err) return res.status(400).send(err);
        if (!rows) {
            // new

            // Uploading images
            const images = [];
            try {
                for (let image of req.body.images) {
                    const base64Data = image.dataURL.replace(/^data:image\/\w+;base64,/, '');
                    const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`);
                    images.push(result.public_id);
                }
            } catch (error) {
                console.error(error);
            }

            insertData({
                ...req.body,
                userid: req.user.id,
                targetId: req.params.id,
                images: JSON.stringify(images),
            }, "comments");
            return res.sendStatus(200);
        } else {

        }
    });

});

app.get("/ratings/:id", (req, res) => {
    const {id} = req.params;
    db.all(`SELECT ratings.*, users.username, users.avatar
            FROM ratings
                     JOIN users ON ratings.userid = users.id
            WHERE ratings.targetId = '${id}'`, (err, rows) => {
        if (err) res.error(err);
        res.json(rows);
    });
});

app.get("/comments/:id", (req, res) => {
    const {id} = req.params;
    db.all(`SELECT comments.*, users.username, users.avatar
            FROM comments
                     JOIN users ON comments.userid = users.id
            WHERE comments.targetId = '${id}'`, (err, rows) => {
        if (err) res.send(err);
        res.json(rows);
    });
});


// Sample route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/places/all', (req, res) => {
    db.all("SELECT * FROM places", (err, rows) => {
        if (err) res.send(err);
        res.json(rows);
    });
});

app.get('/places/:id', (req, res) => {
    const {id} = req.params;
    db.get(`SELECT *
            FROM places
            WHERE id = '${id}';`, (err, rows) => {
        if (err) res.send(err);
        res.json(rows);
    });
})

app.post("/places/update", authenticateToken, (req, res) => {
    if (!req.user.admin) return res.sendStatus(403);
    const result = updateDatabase({
        ...req.body.data,
    }, "places");
    if (result) {
        return res.sendStatus(200);
    } else {
        return res.sendStatus(400);
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});