const {resolve} = require("node:path");
const sql3 = require("sqlite3").verbose();


const datas = [
    {
        "id": "iGame",
        "name": "大埔桌球娱乐城iGame",
        "desc": "*體育館旁邊負1樓",
        "nicks": "[\"ig\", \"iGame\"]",
        "place": "nt",
        "google": "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d230.4588308206564!2d114.1670867!3d22.4538055!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340408380f4331d9%3A0x9d389910c94110a6!2sTai%20Po%20Sports%20Association%20Snooker!5e0!3m2!1sen!2shk!4v1739895074924!5m2!1sen!2shk",
        "star": 3,
        "smoke": 3.3333333333333335,
        "people": 3,
        "locationX": 22.45373896482803,
        "locationY": 114.16726396927531,
        "games": "{\"maimai\": [1, \"Final\", 3], \"maimaidx\": [1, \"Prism\", 6], \"sdvx\": [1, \"Exceed Gear\", 6], \"chunithm\": [1, \"Luminous Plus\", 6], \"jubeat\": [2, \"Beyond the Ave.\", 6], \"taiko\": [2, \"虹\", 8], \"gtdr_dm\": [1, \"V8\", 2], \"reflec\": [1, \"Reflec beat\", 6]}",
        "coins": 1,
        "discord": null
    },
    {
        "id": "goldG",
        "name": "金雞遊戲機\n",
        "desc": "*2樓",
        "nicks": "[\"金雞\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.933913509334!2d114.16922407529299!3d22.318338979673666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404017ac7114249%3A0x3c482981d9dae531!2z6YeR6Zue6YGK5oiy5qmf!5e0!3m2!1szh-TW!2shk!4v1739896512999!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.318350986477494,
        "locationY": 114.17182738056655,
        "games": "{\n  \"maimaidx\": [3, \"Prism\", 6],\n  \"chunithm\": [2, \"Luminous Plus\", 6],\n  \"iidx\": [1, \"\\t32 Pinky Crush\", 8],\n  \"jubeat\": [4, \"Beyond the Ave.\", 5],\n  \"taiko\": [3, \"虹\", 8],\n  \"wacca\": [2, \"V8\", 4]\n}",
        "coins": 1,
        "discord": null
    },
    {
        "id": "goldStar",
        "name": "金星遊戲機中心",
        "desc": "*3樓",
        "nicks": "[\"金星\", \"荃金\", \"GameZone\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.4655242010112!2d114.11376441202957!3d22.373801379548972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403f8f271f91711%3A0x39368740680180e9!2z6YeR5pif6YGK5oiy5qmf5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1739897749119!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.374059329757074,
        "locationY": 114.11629105289371,
        "games": "{   \"maimaidx\": [14, \"Prism\", 6],   \"chunithm\": [2, \"Luminous Plus\", 6],   \"taiko\": [2, \"虹\", 8],   \"taiko_old\": [1, \"13\", 4],   \"gc\": [1, \"4EX\", 6],   \"wacca\": [2, \"reserve\", 4],   \"db\": [1, \"DB\", 4],   \"diva\": [1, \"Future Tone\", 5] }",
        "coins": 0,
        "discord": null
    },
    {
        "id": "newG",
        "name": "旺角新之城遊戲天地",
        "desc": "*負1樓",
        "nicks": "[\"newG\", \"旺新\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.8951027534354!2d114.16719271202838!3d22.31980657958782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400c7db054b2f%3A0x60b470121bfb8150!2z6YGK5oiy5aSp5Zyw!5e0!3m2!1szh-TW!2shk!4v1739898171728!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.320044779750706,
        "locationY": 114.17024506585365,
        "games": "{   \"maimaidx\": [22, \"Prism\", 6],   \"chunithm\": [4, \"Luminous Plus\", 6],   \"jubeat\": [2, \"Beyond the Ave.\", 6],   \"gtdr_gf\": [1, \"V7\", 3],   \"gtdr_dm\": [1, \"V7\", 3],   \"de\": [1, \"-\", 6],   \"taiko\": [4, \"虹\", 8],   \"taiko_old\": [1, \"13\", 3],   \"gc\": [2, \"4EX（4.74）\", 4],   \"wacca\": [3, \"reserve\", 4],   \"db\": [1, \"DB\", 5],   \"diva\": [2, \"Future Tone\", 5] }",
        "coins": 0,
        "discord": null
    },
    {
        "id": "sg",
        "name": "旺角SmartGame\n",
        "desc": "*1樓",
        "nicks": "[\"sg\", \"聰明遊戲\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.9762757202643!2d114.16913091202822!3d22.316736979589923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400c6f6b8bfb5%3A0x98e59e3c4fa01311!2sSmart%20Game!5e0!3m2!1szh-TW!2shk!4v1739900028183!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.31696525977457,
        "locationY": 114.1719257737909,
        "games": "{\n  \"maimaidx\": [4, \"Prism\", 6],\n  \"chunithm\": [4, \"Luminous Plus\", 6],\n  \"sdvx\": [1, \"Exceed Gear\", 6],\n  \"iidx\": [1, \"32 Pinky Crush\", 8],\n  \"jubeat\": [4, \"Beyond the Ave.\", 5],\n  \"ddr\": [1, \"WORLD\", 10],\n  \"pnm\": [1, \"Jam&Fizz\", 6],\n  \"rb\": [1, \"悠久のリフレシア\", 6],\n  \"taiko\": [2, \"虹\", 8],\n  \"gc\": [2, \"4EX（4.74）\", 4],\n  \"wacca\": [2, \"reserve\", 4],\n  \"diva\": [2, \"Future Tone\", 5]\n}",
        "coins": 1,
        "discord":
    },
    {
        "id": "hl",
        "name": "海龍遊戲廣場\n",
        "desc": null,
        "nicks": "[]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387.89556009087727!2d114.19705907778054!3d22.342099048853473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340406d9642ee5a9%3A0x10b42dbfc0d82f64!2z5rW36b6N6Zu75a2Q6YGK5qiC5buj5aC0!5e0!3m2!1szh-TW!2shk!4v1739900729958!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.34205002446067,
        "locationY": 114.19727165487807,
        "games": "{\"jubeat\": [3, \"festo\", 6]}",
        "coins": 1,
        "discord": null
    },
    {
        "id": "hlwGz",
        "name": "荷里活遊戲城",
        "desc": "*3樓",
        "nicks": "[\"荷里活\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.3553531361463!2d114.19794715341008!3d22.340207327367715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340406db2956e90d%3A0xde40608aa7d3c66!2z6I236YeM5rS76YGK5oiy5Z-O!5e0!3m2!1szh-TW!2shk!4v1739900844411!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.34039587495321,
        "locationY": 114.20353151251747,
        "games": "{\n  \"maimaidx\": [12, \"Prism\", 6],\n  \"chunithm\": [4, \"Luminous Plus\", 6],\n  \"taiko\": [3, \"虹\", 6],\n  \"gc\": [1, \"4EX\", 6],\n  \"wacca\": [4, \"reserve\", 4],\n  \"db\": [1, \"?\", 4],\n  \"diva\": [1, \"Future Tone\", 5]\n}",
        "coins": 0,
        "discord": null
    },
    {
        "id": "mg",
        "name": "銘鏗電子遊戲機中心 ",
        "desc": null,
        "nicks": "[]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.8573785675762!2d114.12719691198144!3d22.283391779614035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403ff9aedf424a1%3A0x1c30eba4de091aca!2z6YqY6Y-X6Zu75a2Q6YGK5oiy5qmf5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1739929718533!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.2835506211697,
        "locationY": 114.12988448537526,
        "games": "{\"maimai\": [1, \"Milk\", 3]}",
        "coins": 1,
        "discord": null
    },
    {
        "id": "sl",
        "name": "沙龍遊戲機中心 ",
        "desc": null,
        "nicks": "[\"沙龍\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.1904129486984!2d114.18958311198351!3d22.384178079541357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404064d5016a19f%3A0x775532e659243db8!2z5rKZ6b6N6YGK5oiy5qmf5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1739929905708!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.384366567607504,
        "locationY": 114.19244234675178,
        "games": "{ \"maimaidx\": [2, \"Prism\", 6], \"chunithm\": [2, \"Luminous Plus\", 6], \"iidx\": [1, \"32 Pinky Crush\", 8], \"jubeat\": [2, \"Beyond the Ave.\", 6], \"gtdr_gf\": [1, \"GALAXY WAVE\", 7], \"gtdr_dm\": [1, \"GALAXY WAVE\", 8], \"taiko\": [1, \"虹\", 8] }",
        "coins": 1,
        "discord": null
    },
    {
        "id": "168",
        "name": "168遊戲機中心 ",
        "desc": null,
        "nicks": "[\"168\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.0429863817385!2d114.22033241198214!3d22.314213979591802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404010cf4af8efd%3A0x23bdab50e5074076!2zMTY46YGK5oiy5qmf5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1739930123319!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.314412487709156,
        "locationY": 114.22332039278123,
        "games": "{ \"maimaidx\": [1, \"Prism\", 6], \"chunithm\": [2, \"Luminous Plus\", 6], \"taiko\": [1, \"虹\", 8] }",
        "coins": 1,
        "discord": null
    },
    {
        "id": "ng",
        "name": "新港遊戲機中心 ",
        "desc": null,
        "nicks": "[\"新港\"]",
        "place": "kn",
        "google": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.475297752406!2d114.16693121198188!3d22.297857379603677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400ed61ef67f3%3A0xd55672970321869e!2z5paw5riv6YGK5oiy5qmf5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1739930283663!5m2!1szh-TW!2shk",
        "star": null,
        "smoke": null,
        "people": null,
        "locationX": 22.297956645322735,
        "locationY": 114.1700157523041,
        "games": "{ \"maimaidx\": [3, \"Prism\", 6], \"jubeat\": [4, \"Beyond the Ave.\", 6], \"taiko\": [2, \"虹\", 6], \"wacca\": [2, \"reserve\", 5] }",
        "coins": 1,
        "discord": null
    }
]

// init db
const db = new sql3.Database(resolve(__dirname, "./test.sqlite"), sql3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err);
    }
});
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