const sql3 = require("sqlite3").verbose();

let sql;

const db = new sql3.Database("./test.sqlite", sql3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err);
    }
});

db.all("SELECT * FROM places", (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
}, );

