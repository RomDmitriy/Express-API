import db from "../db.js";

export class ItemController {
    async addItem(req, res) {
        const searchItem = await db.query(`SELECT id FROM Items WHERE name = $1;`, [req.body.name]);
        if (!searchItem.rowCount) {
            await db.query(`INSERT INTO Items (name, image) VALUES ($1, $2);`, [req.body.name, req.body.image]);
            res.json(true);
        }
        else {
            res.json(false);
        }
    }

    async getList(req, res) {
        const items = await db.query(`SELECT id, name FROM Items;`);
        res.json([{items}]);
    }
}