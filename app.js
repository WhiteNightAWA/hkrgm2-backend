const {resolve} = require("node:path");
const sql3 = require("sqlite3").verbose();

function insertData(db, datas) {
    db.serialize(() => {

        const keys = Object.keys(datas[0]);
        const placeholders = keys.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO places (${keys.join(', ')})
                           VALUES (${placeholders})`;
        const stmt = db.prepare(insertSQL);

        datas.forEach(item => {
            const values = keys.map(key => item[key] !== null ? item[key] : null);
            stmt.run(values);
        });

// Finalize the statement
        stmt.finalize();
    });
}