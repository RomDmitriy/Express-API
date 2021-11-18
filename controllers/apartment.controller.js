import db from "../db.js";

export class ApartmentController {
    async addApartment(req, res) {
        console.log();
        console.log(
            "[Create apartment] New apartment with name = " + req.body.name
        );
        if (
            req.body.ownerid != null &&
            req.body.name != null &&
            typeof req.body.ownerid == "number"
        ) {
            let newApartmentID = 0;
            if (req.body.image == null) {
                newApartmentID = await db.query(
                    `INSERT INTO Items (name, isunique) VALUES ('${req.body.name}', ${req.body.unique}) RETURNING id;`
                );
            } else {
                newApartmentID = await db.query(
                    `INSERT INTO Items (name, image, isunique) VALUES ('${req.body.name}', '${req.body.image}', ${req.body.unique}) RETURNING id;`
                );
            }
            console.log("Success!");
            res.json(newApartmentID.rows[0]);
        } else {
            console.log("Failure!");
            res.json(false);
        }
    }
}
