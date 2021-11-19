import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwt_key } from "../private-info.js";

export class UserController {
    async createUser(req, res) {
        console.log();
        console.log(
            "[Create user] User with login = " + req.body.login + "..."
        );
        //validator
        if (
            req.body.login.length > 3 &&
            req.body.login.length < 33 &&
            req.body.password.length > 5 &&
            req.body.password.length < 33
        ) {
            const user = await db.query(
                `SELECT id FROM Auth WHERE login = '${req.body.login}';`
            );
            if (!user.rowCount) {
                const secPass = bcrypt.hashSync(
                    req.body.password,
                    bcrypt.genSaltSync(10)
                );

                await db.query(
                    `INSERT INTO Auth (login, nickname, password) VALUES ('${req.body.login}', '${req.body.login}', '${secPass}');`
                );

                //генерируем токен
                const token = jwt.sign(
                    {
                        login: req.body.login,
                        password: secPass,
                    },
                    jwt_key,
                    { expiresIn: 3600 }
                );

                console.log("Success!");
                res.status(201).json({
                    token: token,
                });
            } else {
                console.log("Failure!");
                res.status(409);
            }
        } else {
            console.log("Failure!");
            res.status(400);
        }
    }

    async loginUser(req, res) {
        console.log();
        console.log(
            new Date().getUTCHours() +
                3 +
                ":" +
                new Date().getUTCMinutes() +
                ":" +
                new Date().getUTCSeconds() +
                " - [Login user] User with login = " +
                req.body.login +
                "..."
        );
        if (req.body.login != null && req.body.password != null) {
            const user = await db.query(
                `SELECT password FROM Auth WHERE login = '${req.body.login}';`
            );
            //если пользователь найден
            if (user.rowCount) {
                if (
                    bcrypt.compareSync(req.body.password, user.rows[0].password)
                ) {
                    //генерируем токен
                    const token = jwt.sign(
                        {
                            login: req.body.login,
                            password: user.rows[0].password,
                        },
                        jwt_key,
                        { expiresIn: 3600 }
                    );

                    console.log("Success!");
                    res.status(200).json({ token: token });
                }
            }
            //если пользователя с таким логином нет
            else {
                console.log("Failure!");
                res.status(400);
            }
        }
        //если неправильный запрос
        else {
            console.log("Failure!");
            res.status(400);
        }
    }

    // async check(req, res) {
    //     console.log();
    //     console.log(
    //         new Date().getUTCHours() +
    //             3 +
    //             ":" +
    //             new Date().getUTCMinutes() +
    //             ":" +
    //             new Date().getUTCSeconds() +
    //             " - [Check] User with name = " +
    //             req.body.login +
    //             "..."
    //     );
    //     if (req.body.login != null && req.body.password != null) {
    //         const user = await db.query(
    //             `SELECT nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc FROM Auth WHERE login = '${req.body.login}' AND password = '${req.body.password}';`
    //         );
    //         if (user.rowCount) {
    //             let data = new Date();
    //             await db.query(
    //                 `UPDATE Auth SET last_login_utc = $1 WHERE id = $2;`,
    //                 [
    //                     data.getUTCFullYear() +
    //                         "-" +
    //                         (data.getUTCMonth() + 1) +
    //                         "-" +
    //                         data.getUTCDate() +
    //                         " " +
    //                         data.getUTCHours() +
    //                         ":" +
    //                         data.getUTCMinutes() +
    //                         ":" +
    //                         data.getUTCSeconds(),
    //                     user.rows[0].id,
    //                 ]
    //             );
    //             console.log("Success!");
    //             res.json(user.rows[0]);
    //         } else {
    //             console.log("Failure!");
    //             res.json(false);
    //         }
    //     } else {
    //         console.log("Failure!");
    //         res.json(false);
    //     }
    // }

    // async getUser(req, res) {
    //     console.log();
    //     console.log("[Get user] User with id = " + req.params.id + "...");
    //     //проверка на передачу параметра
    //     if (req.params.id != null && parseInt(req.params.id) == req.params.id) {
    //         const user = await db.query(
    //             `SELECT login, nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc FROM Auth WHERE id = ${req.params.id};`
    //         );
    //         //проверка на нахождение пользователя в БД
    //         if (user.rowCount) {
    //             console.log("Success!");
    //             res.json(user.rows[0]);
    //         } else {
    //             console.log("Failure!");
    //             res.json(false);
    //         }
    //     } else {
    //         console.log("Failure!");
    //         res.json(false);
    //     }
    // }

    // async getUserQuery(req, res) {
    //     console.log();
    //     console.log("[Get user query] User with id = " + req.params.id + "...");

    //     let query = new Array();

    //     //парсер запрашиваемых полей
    //     if (req.params.query.includes("login")) {
    //         query.push("login");
    //     }
    //     if (req.params.query.includes("nickname")) {
    //         query.push("nickname");
    //     }
    //     if (req.params.query.includes("about")) {
    //         query.push("about");
    //     }
    //     if (req.params.query.includes("avatar_url")) {
    //         query.push("avatar_url");
    //     }
    //     if (req.params.query.includes("last_login_utc")) {
    //         query.push(
    //             "to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc"
    //         );
    //     }

    //     query = query.join(", ");

    //     if (parseInt(req.params.id) == req.params.id) {
    //         const user = await db.query(
    //             `SELECT ${query} FROM Auth WHERE id = ${req.params.id};`
    //         );
    //         if (user.rowCount) {
    //             console.log("Success!");
    //             res.json(user.rows[0]);
    //         } else {
    //             console.log("Failure!");
    //             res.json(false);
    //         }
    //     } else {
    //         console.log("Failure!");
    //         res.json(false);
    //     }
    // }

    async updatePassword(req, res) {
        console.log();
        console.log(
            "[Update password] User with id = " + req.params.id + "..."
        );
        const checkUser = await db.query(
            `SELECT id FROM Auth WHERE id = ${req.params.id};`
        );
        if (checkUser.rowCount && req.body.password != null) {
            await db.query(
                `UPDATE Auth SET password = '${req.body.password}' WHERE id = ${req.params.id};`
            );
            console.log("Success!");
            res.json(true);
        } else {
            console.log("Failure!");
            res.json(false);
        }
    }

    async updateAvatar(req, res) {
        console.log();
        console.log("[Update avatar] User with id = " + req.params.id + "...");
        const checkUser = await db.query(
            `SELECT id FROM Auth WHERE id = ${req.params.id}`
        );
        if (checkUser.rowCount) {
            await db.query(
                `UPDATE Auth SET avatar_url = '${req.body.avatarURL}' WHERE id = ${req.params.id};`
            );
            console.log("Success!");
            res.json(true);
        } else {
            console.log("Failure!");
            res.json(false);
        }
    }

    async updateNickname(req, res) {
        console.log();
        console.log(
            "[Update nickname] User with id = " + req.params.id + "..."
        );
        const checkUser = await db.query(
            `SELECT id FROM Auth WHERE id = ${req.params.id}`
        );
        if (checkUser.rowCount) {
            await db.query(
                `UPDATE Auth SET nickname = '${req.body.nick}' WHERE id = ${req.params.id};`
            );
            console.log("Success!");
            res.json(true);
        } else {
            console.log("Failure!");
            res.json(false);
        }
    }

    async deleteUser(req, res) {
        console.log();
        console.log("[Delete user] User with id = " + req.params.id + "...");
        const delUser = await db.query(
            `SELECT id FROM Auth WHERE id = ${req.params.id}`
        );
        if (delUser.rowCount) {
            await db.query(
                `DELETE FROM Apartments WHERE owner_id = ${req.params.id};`
            );
            await db.query(`DELETE FROM Auth WHERE id = ${req.params.id};`);
            console.log("Success!");
            res.json(true);
        } else {
            console.log("Failure!");
            res.json(false);
        }
    }
}
