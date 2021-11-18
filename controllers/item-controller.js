import db from "../db.js";

export class ItemController {
    async addItem(req, res) {
        const searchItem = await db.query(`SELECT id FROM Items WHERE name = $1;`, [req.body.name]);
        if (!searchItem.rowCount) {
            const newItemID = await db.query(`INSERT INTO Items (name, image, isunique) VALUES ($1, $2, $3) RETURNING id;`, [req.body.name, req.body.image, req.body.unique]);
            res.json(newItemID.rows[0]);
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