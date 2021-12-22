import db from "../../shared/database.js";

export class ItemController {
    async addItem(req, res) {
        //защита от вылета
        let name = req.body.name;
        if (name === undefined) {
            name = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Creating new user with name = " +
                name
        );
        //TODO BELOW
        if (
            req.body.name != null &&
            req.body.unique != null &&
            typeof req.body.unique == "boolean"
        ) {
            const searchItem = await db.query(
                `SELECT id FROM Items WHERE name = '${req.body.name}';`
            );
            let newItemID = 0;
            if (!searchItem.rowCount) {
                if (req.body.image == null) {
                    newItemID = await db.query(
                        `INSERT INTO Items (name, is_unique) VALUES ('${req.body.name}', ${req.body.unique}) RETURNING id;`
                    );
                } else {
                    newItemID = await db.query(
                        `INSERT INTO Items (name, image, is_unique) VALUES ('${req.body.name}', '${req.body.image}', ${req.body.unique}) RETURNING id;`
                    );
                }
                console.log("Success!");
                res.json(newItemID.rows[0]);
            } else {
                console.log("Failure!");
                res.json(false);
            }
        } else {
            console.log("Failure!");
            res.json(false);
        }
    }

    //IN DEV
    async getList(req, res) {
        console.log();
        const items = await db.query(`SELECT id, name FROM Items;`);
        res.json([{ items }]);
    }
}
