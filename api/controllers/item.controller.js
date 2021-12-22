import db from "../../shared/database.js";
import { getCurrTime } from "../../shared/times.js";

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
        " Creating new item with name = " +
        name
    );

    if (
      req.body?.name != null &&
      req.body?.description != null &&
      req.body?.count != null &&
      typeof req.body?.count == "number" &&
      req.body?.store_name != null &&
      req.body?.room_name != null &&
      req.body?.container_name != null &&
      req.body?.mark != null &&
      typeof req.body?.mark == "boolean"
    ) {
      //let res;

      // ищем комнату
      // try {
      //     res = await db.query(`SELECT id FROM containers WHERE name='${req.body.room_name}';`);
      // }
      // catch(err)
      // {
      //     console.log("Failure! Status code: 500".red);
      //     console.log(
      //         "Warning! Database is unavaliable!".bgYellow.black
      //     );
      //     res.status(500).json(); //проблема с подключением к БД
      //     return;
      // }

      // if (res.rowCount) {
      //     console.log("Failure! Status code: 404 (Container not exists)".red);
      //     res.status(404).json(); //Контейнер не найден
      //     return;
      // }

      try {
        await db.query(`INSERT INTO items (container_name, room_name, store_name, name, description, count, mark) VALUES (
                    '${req.body.container_name}',
                    '${req.body.room_name}',
                    '${req.body.store_name}',
                    '${req.body.name}',
                    '${req.body.description}',
                    '${req.body.count}',
                    '${req.body.mark}'
                );`);

        //всё хорошо
        console.log("Success! Status code: 201".green);
        res.status(201).json(); //всё хорошо
        return;
      } catch (err) {
        console.log(err);
        console.log("Failure! Status code: 500".red);
        console.log("Warning! Database is unavaliable!".bgYellow.black);
        res.status(500).json(); //проблема с подключением к БД
        return;
      }
    } else {
      console.log("Failure! Status code: 400 (Bad request)".red);
      res.status(400).json(); //проблема с подключением к БД
      return;
    }
  }

  //IN DEV
  async getList(req, res) {
    console.log();
    const items = await db.query(`SELECT id, name FROM Items;`);
    res.json([{ items }]);
  }
}
