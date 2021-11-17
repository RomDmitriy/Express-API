import db from "../db.js";

export class ApartmentController {
    async addUser(req, res) {
        const searchUser = await db.query(`SELECT id FROM Auth WHERE id = $1`, [req.body.userID]);
        if (searchUser.rowCount) {
            await db.query(`INSERT INTO apartments (owner_id, name, canvas) VALUES ($1, $2, $3);`, [req.body.userID, req.body.name, req.body.canvas]);
            res.json(true);
        }
        else {
            res.json(false);
        }
    }
}