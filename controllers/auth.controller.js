import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwt_key } from "../private-info.js";
import faker from "faker";
import { getCurrTime } from "../currTime.js";
import colors from "colors";

function getCurrDateTime() {
    let data = new Date();
    return (
        data.getUTCFullYear() +
        "-" +
        (data.getUTCMonth() + 1) +
        "-" +
        data.getUTCDate() +
        " " +
        data.getUTCHours() +
        ":" +
        data.getUTCMinutes() +
        ":" +
        data.getUTCSeconds()
    );
}

export class UserController {
    async createUser(req, res) {
        let login = req.body.login;
        if (login === undefined) {
            login = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Creating new user with login = " +
                login.bgGray.hidden
        );
        //валидация длин данных
        if (
            req.body.login.length > 3 &&
            req.body.login.length < 33 &&
            req.body.password.length > 5 &&
            req.body.password.length < 33
        ) {
            let user;

            try {
                user = await db.query(
                    `SELECT id FROM Auth WHERE login = '${req.body.login}';`
                );
            } catch (err) {
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json();
                return;
            }

            if (!user.rowCount) {
                const secPass = bcrypt.hashSync(
                    req.body.password,
                    bcrypt.genSaltSync(10)
                );

                //генерируем токены
                const tokens = {
                    access_token: jwt.sign(
                        { login: req.body.login, password: secPass },
                        jwt_key,
                        { expiresIn: 1800 }
                    ),
                    refresh_token: faker.finance.bitcoinAddress(),
                };

                try {
                    await db.query(
                        `INSERT INTO Auth (login, nickname, password, last_login_utc, refreshtoken) VALUES (
                            '${req.body.login}', '${
                            req.body.login
                        }', '${secPass}', '${getCurrDateTime()}', '${
                            tokens.refresh_token
                        }');`
                    );
                } catch (err) {
                    console.log("Failure!".red.bgWhite);
                    res.status(409).json();
                    return;
                }

                console.log("Success!".green);
                res.status(201).json(tokens);
            } else {
                console.log("Failure!".red);
                res.status(409).json();
            }
        } else {
            console.log("Failure!".red);
            res.status(400).json();
        }
    }

    async loginUser(req, res) {
        let login = req.body.login;
        if (login === undefined) {
            login = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Auth user with login = " +
                login.bgGray.hidden
        );
        if (req.body.login != null && req.body.password != null) {
            let user;

            try {
                user = await db.query(
                    `SELECT password FROM Auth WHERE login = '${req.body.login}';`
                );
            } catch (err) {
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json();
                return;
            }
            //если пользователь не найден
            if (!user.rowCount) {
                console.log("Failure!".red);
                res.status(404).json();
                return;
            }

            if (bcrypt.compareSync(req.body.password, user.rows[0].password)) {
                //генерируем токены
                let newTokens = {
                    access_token: jwt.sign(
                        {
                            login: req.body.login,
                            password: user.rows[0].password,
                        },
                        jwt_key,
                        { expiresIn: 1800 }
                    ),
                    refresh_token: faker.finance.bitcoinAddress(),
                };

                try {
                    await db.query(
                        `UPDATE Auth SET refreshtoken = '${
                            newTokens.refresh_token
                        }', last_login_utc = '${getCurrDateTime()}' WHERE login = '${
                            req.body.login
                        }'`
                    );
                } catch (err) {
                    console.log(
                        "Warning!  Database is not avaliable!".bgYellow.bold.black
                    );
                    res.status(500).json();
                    return;
                }

                console.log("Success!".green);
                res.status(200).json(newTokens);
            }
            //если неправильный пароль
            else {
                console.log("Failure!".red);
                res.status(401).json();
            }
        }
        //если неправильный запрос
        else {
            console.log("Failure!".red);
            res.status(400).json();
        }
    }

    //обновление токенов
    async updateJWT(req, res) {
        let token = req.body.refresh_token;
        if (token === undefined) {
            token = "undefined";
        }

        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                "Update token for user with refresh token = " +
                token.bgGray.hidden
        );

        if (req.body.refresh_token === null) {
            console.log("Failure!".red);
            res.status(400).json();
            return;
        }

        let user;

        try {
            user = await db.query(
                `SELECT login, password FROM Auth WHERE refreshtoken = '${req.body.refresh_token}'`
            );
        } catch (err) {
            console.log(
                "Warning!  Database is not avaliable!".bgYellow.bold.black
            );
            res.status(500).json();
            return;
        }

        //если пользователя с таким токеном нет
        if (!user.rowCount) {
            console.log("Failure!".red);
            res.status(404).json();
            return;
        }

        let newTokens = {
            access_token: jwt.sign(
                {
                    login: user.rows[0].login,
                    password: user.rows[0].password,
                },
                jwt_key,
                { expiresIn: 1800 }
            ),
            refresh_token: faker.finance.bitcoinAddress(),
        };

        try {
            await db.query(
                `UPDATE Auth SET refreshtoken = '${
                    newTokens.refresh_token
                }', last_login_utc = '${getCurrDateTime()}' WHERE refreshtoken = '${
                    req.body.refresh_token
                }'`
            );
        } catch (err) {
            console.log(
                "Warning!  Database is not avaliable!".bgYellow.bold.black
            );
            res.status(500).json();
            return;
        }

        console.log("Success!".green);
        res.status(200).json(newTokens);
    }

    //получение данных
    async getUser(req, res) {
        let token = req.body.access_token;
        if (token === undefined) {
            token = "undefined";
        }

        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                "Get user with token = " +
                token.bgGray.hidden
        );

        try {
            let userDecoded = jwt.verify(req.body.access_token, jwt_key);

            let user;

            try {
                user = await db.query(
                    `SELECT nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );
            } catch (err) {
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json();
                return;
            }

            //проверка на нахождение пользователя в БД
            if (user.rowCount) {
                console.log("Success!".green);
                res.status(200).json(user.rows[0]);
            } else {
                console.log("Failure!".red);
                res.status(404).json();
            }
        } catch (err) {
            console.log("Failure!".red);
            res.status(401).json();
            return;
        }
    }

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
    //             console.log("Success!".green);
    //             res.json(user.rows[0]);
    //         } else {
    //             console.log("Failure!".red);
    //             res.json(false);
    //         }
    //     } else {
    //         console.log("Failure!".red);
    //         res.json(false);
    //     }
    // }

    // async updatePassword(req, res) {
    //     console.log();
    //     console.log(
    //         "[Update password] User with id = " + req.params.id + "..."
    //     );
    //     const checkUser = await db.query(
    //         `SELECT id FROM Auth WHERE id = ${req.params.id};`
    //     );
    //     if (checkUser.rowCount && req.body.password != null) {
    //         await db.query(
    //             `UPDATE Auth SET password = '${req.body.password}' WHERE id = ${req.params.id};`
    //         );
    //         console.log("Success!".green);
    //         res.json(true);
    //     } else {
    //         console.log("Failure!".red);
    //         res.json(false);
    //     }
    // }

    // async updateAvatar(req, res) {
    //     console.log();
    //     console.log("[Update avatar] User with id = " + req.params.id + "...");
    //     const checkUser = await db.query(
    //         `SELECT id FROM Auth WHERE id = ${req.params.id}`
    //     );
    //     if (checkUser.rowCount) {
    //         await db.query(
    //             `UPDATE Auth SET avatar_url = '${req.body.avatarURL}' WHERE id = ${req.params.id};`
    //         );
    //         console.log("Success!".green);
    //         res.json(true);
    //     } else {
    //         console.log("Failure!".red);
    //         res.json(false);
    //     }
    // }

    // async updateNickname(req, res) {
    //     console.log();
    //     console.log(
    //         "[Update nickname] User with id = " + req.params.id + "..."
    //     );
    //     const checkUser = await db.query(
    //         `SELECT id FROM Auth WHERE id = ${req.params.id}`
    //     );
    //     if (checkUser.rowCount) {
    //         await db.query(
    //             `UPDATE Auth SET nickname = '${req.body.nick}' WHERE id = ${req.params.id};`
    //         );
    //         console.log("Success!".green);
    //         res.json(true);
    //     } else {
    //         console.log("Failure!".red);
    //         res.json(false);
    //     }
    // }

    // async deleteUser(req, res) {
    //     console.log();
    //     console.log("[Delete user] User with id = " + req.params.id + "...");
    //     const delUser = await db.query(
    //         `SELECT id FROM Auth WHERE id = ${req.params.id}`
    //     );
    //     if (delUser.rowCount) {
    //         await db.query(
    //             `DELETE FROM Apartments WHERE owner_id = ${req.params.id};`
    //         );
    //         await db.query(`DELETE FROM Auth WHERE id = ${req.params.id};`);
    //         console.log("Success!".green);
    //         res.json(true);
    //     } else {
    //         console.log("Failure!".red);
    //         res.json(false);
    //     }
    // }
}
