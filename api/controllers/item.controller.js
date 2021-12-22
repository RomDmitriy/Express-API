import db from "../../shared/database.js";
import { getCurrTime } from "../../shared/times.js";
import jwt from "jsonwebtoken";
import { jwt_key } from "../../security_config.js";

export class ItemController {
  async addItem(req, res) {
    //защита от вылета
    let access_token = req.headers.authorization;
    if (access_token === undefined) {
      access_token = "undefined";
    }

    //логирование
    console.log();
    console.log(
      (" " + getCurrTime() + " ").bgWhite.black +
        " Creating new item for user with access token = " +
        access_token
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
      //проверяем access_token на валидность
      try {
        //если токен невалидный, то jwt.verify вызовет ошибку
        let userDecoded = jwt.verify(access_token, jwt_key);

        //проверка на нахождение пользователя в БД
        let user;
        try {
          user = await db.query(
            `SELECT id FROM auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
          );
        } catch (err) {
          console.log("Failure! Status code: 500".red);
          console.log("Warning! Database is unavaliable!".bgYellow.black);
          res.status(500).json(); //проблема с подключением к БД
          return;
        }

        //если пользователь найден
        if (user.rowCount) {
          try {
            await db.query(`INSERT INTO items (owner_id, container_name, room_name, store_name, name, description, count, mark) VALUES (
                '${user.rows[0].id}',
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
            console.log("Failure! Status code: 500".red);
            console.log("Warning! Database is unavaliable!".bgYellow.black);
            res.status(500).json(); //проблема с подключением к БД
            return;
          }
        } else {
          console.log("Failure! Status code: 404 (User not found)".red);
          res.status(404).json(); //пользователь с таким токеном не существует
          return;
        }
      } catch (err) {
        //если токен недействителен
        console.log("Failure! Status code: 401 (Token expired)".red);
        res.status(401).json(); //токен недействителен
        return;
      }
    } else {
      console.log("Failure! Status code: 400 (Bad request)".red);
      res.status(400).json(); //проблема с подключением к БД
      return;
    }
  }

  async getItems(req, res) {
    //защита от вылета
    let access_token = req.headers.authorization;
    if (access_token === undefined) {
      access_token = "undefined";
    }

    //логирование
    console.log();
    console.log(
      (" " + getCurrTime() + " ").bgWhite.black +
        " Get items for user with access token = " +
        access_token
    );

    try {
      //если токен невалидный, то jwt.verify вызовет ошибку
      let userDecoded = jwt.verify(access_token, jwt_key);

      //проверка на нахождение пользователя в БД
      let user;
      try {
        user = await db.query(
          `SELECT id FROM auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
        );
      } catch (err) {
        console.log("Failure! Status code: 500".red);
        console.log("Warning! Database is unavaliable!".bgYellow.black);
        res.status(500).json(); //проблема с подключением к БД
        return;
      }

      //если пользователь найден
      if (user.rowCount) {
        try {
          let items = await db.query(
            `SELECT * FROM items WHERE owner_id=${user.rows[0].id};`
          );

          //всё хорошо
          console.log("Success! Status code: 200".green);
          res.status(200).json(items.rows); //всё хорошо
          return;
        } catch (err) {
          console.log("Failure! Status code: 500".red);
          console.log("Warning! Database is unavaliable!".bgYellow.black);
          res.status(500).json(); //проблема с подключением к БД
          return;
        }
      } else {
        console.log("Failure! Status code: 404 (User not found)".red);
        res.status(404).json(); //пользователь с таким токеном не существует
        return;
      }
    } catch (err) {
      //если токен недействителен
      console.log("Failure! Status code: 401 (Token expired)".red);
      res.status(401).json(); //токен недействителен
      return;
    }
  }

  async deleteItem(req, res) {
    //защита от вылета
    let access_token = req.headers.authorization;
    if (access_token === undefined) {
      access_token = "undefined";
    }

    //логирование
    console.log();
    console.log(
      (" " + getCurrTime() + " ").bgWhite.black +
        " Delete item for user with access token = " +
        access_token
    );

    try {
      //если токен невалидный, то jwt.verify вызовет ошибку
      let userDecoded = jwt.verify(access_token, jwt_key);

      //проверка на нахождение пользователя в БД
      let user;
      try {
        user = await db.query(
          `SELECT id FROM auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
        );
      } catch (err) {
        console.log("Failure! Status code: 500".red);
        console.log("Warning! Database is unavaliable!".bgYellow.black);
        res.status(500).json(); //проблема с подключением к БД
        return;
      }

      //если пользователь найден
      if (user.rowCount) {
        try {
          await db.query(
            `DELETE FROM items WHERE owner_id=${user.rows[0].id} AND id=${req.params.item_id};`
          );

          //всё хорошо
          console.log("Success! Status code: 200".green);
          res.status(200).json(); //всё хорошо
          return;
        } catch (err) {
          console.log("Failure! Status code: 500".red);
          console.log("Warning! Database is unavaliable!".bgYellow.black);
          res.status(500).json(); //проблема с подключением к БД
          return;
        }
      } else {
        console.log("Failure! Status code: 404 (User not found)".red);
        res.status(404).json(); //пользователь с таким токеном не существует
        return;
      }
    } catch (err) {
      //если токен недействителен
      console.log("Failure! Status code: 401 (Token expired)".red);
      res.status(401).json(); //токен недействителен
      return;
    }
  }

  async updateMark(req, res) {
    //защита от вылета
    let access_token = req.headers.authorization;
    if (access_token === undefined) {
      access_token = "undefined";
    }

    //логирование
    console.log();
    console.log(
      (" " + getCurrTime() + " ").bgWhite.black +
        " Update mark for user with access token = " +
        access_token
    );

    if (req.params.item_mark === "true" || req.params.item_mark === "false") {
      try {
        //если токен невалидный, то jwt.verify вызовет ошибку
        let userDecoded = jwt.verify(access_token, jwt_key);

      //проверка на нахождение пользователя в БД
      let user;
      try {
        user = await db.query(
          `SELECT id FROM auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
        );
      } catch (err) {
        console.log("Failure! Status code: 500".red);
        console.log("Warning! Database is unavaliable!".bgYellow.black);
        res.status(500).json(); //проблема с подключением к БД
        return;
      }

        try {
          console.log(`UPDATE items SET mark=${req.params.item_mark} WHERE owner_id=${user.rows[0].id} AND id=${req.params.item_id};`)
          await db.query(
            `UPDATE items SET mark=${req.params.item_mark} WHERE owner_id=${user.rows[0].id} AND id=${req.params.item_id};`
          );

          //всё хорошо
          console.log("Success! Status code: 200".green);
          res.status(200).json(); //всё хорошо
          return;
        } catch (err) {
          console.log("Failure! Status code: 500".red);
          console.log("Warning! Database is unavaliable!".bgYellow.black);
          res.status(500).json(); //проблема с подключением к БД
          return;
        }
      } catch (err) {
        //если токен недействителен
        console.log("Failure! Status code: 401 (Token expired)".red);
        res.status(401).json(); //токен недействителен
        return;
      }
    }
    else{
      console.log("Failure! Status code: 400 (Bad request)".red);
      res.status(400).json(); //прохой запрос
      return;
    }
  }
}
