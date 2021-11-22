import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwt_key } from "../private-info.js";
import faker from "faker";
import { getCurrTime } from "../currTime.js";
import "colors";
import { getCurrDateTime } from "../currTime.js";

export class UserController {
    async createUser(req, res) {
        //защита от вылета
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
            //шифруем пароль
            const secPass = bcrypt.hashSync(
                req.body.password,
                bcrypt.genSaltSync(10)
            );

            //генерируем токены
            const tokens = {
                access_token: jwt.sign(
                    { login: req.body.login, password: secPass },
                    jwt_key,
                    { expiresIn: 1800 } //30 минут
                ),
                refresh_token: faker.finance.bitcoinAddress(),
            };

            //отправляем запрос на добавление пользователя
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
                console.log("Failure!".red);
                res.status(409).json(); //пользователь уже существует
                return;
            }

            //возвращаем токены и сообщение об успехе
            console.log("Success!".green);
            res.status(201).json(tokens); //всё хорошо
        } else {
            console.log("Failure!".red);
            res.status(400).json(); //плохой запрос (пустые поля или неправильная длина)
        }
    }

    async userAuthorization(req, res) {
        //защита от вылета
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

        //защита от пустых логина или пароля
        if (req.body.login != null && req.body.password != null) {
            let user;

            //пробуем найти пользователя с таким логином
            try {
                user = await db.query(
                    `SELECT password FROM Auth WHERE login = '${req.body.login}';`
                );
            } catch (err) {
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //если пользователь не найден
            if (!user.rowCount) {
                console.log("Failure!".red);
                res.status(404).json(); //пользователь не найден
                return;
            }

            //если пользователь найден, то сравниваем пароли
            if (bcrypt.compareSync(req.body.password, user.rows[0].password)) {
                //генерируем новые токены
                let newTokens = {
                    access_token: jwt.sign(
                        {
                            login: req.body.login,
                            password: user.rows[0].password,
                        },
                        jwt_key,
                        { expiresIn: 1800 } //30 минут
                    ),
                    refresh_token: faker.finance.bitcoinAddress(),
                };

                //отправляем новый refresh_token в БД
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
                        "Warning!  Database is not avaliable!".bgYellow.bold
                            .black
                    );
                    res.status(500).json(); //проблема с подключением к БД
                    return;
                }

                //выводим сообщение об успехе и возвращаем новые токены
                console.log("Success!".green);
                res.status(200).json(newTokens); //всё хорошо
            }
            //если неправильный пароль
            else {
                console.log("Failure!".red);
                res.status(401).json(); //неправильный пароль
            }
        }
        //если неправильный запрос
        else {
            console.log("Failure!".red);
            res.status(400).json(); //неправильный запрос
        }
    }

    async getNewJWTtokens(req, res) {
        //защита от вылета
        if (req.body.refresh_token === undefined) {
            req.body.refresh_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                "Update token for user with refresh token = " +
                req.body.refresh_token.bgGray.hidden
        );

        //защита от плохого запроса
        if (req.body.refresh_token === null) {
            console.log("Failure!".red);
            res.status(400).json(); //плохой запрос
            return;
        }

        let user;

        //ищем нужного пользователя
        try {
            user = await db.query(
                `SELECT login, password FROM Auth WHERE refreshtoken = '${req.body.refresh_token}'`
            );
        } catch (err) {
            console.log(
                "Warning!  Database is not avaliable!".bgYellow.bold.black
            );
            res.status(500).json(); //проблема с подключением к БД
            return;
        }

        //если пользователя с таким токеном нет
        if (!user.rowCount) {
            console.log("Failure!".red);
            res.status(404).json(); //пользователь не найден
            return;
        }

        //генерируем токены
        let newTokens = {
            access_token: jwt.sign(
                {
                    login: user.rows[0].login,
                    password: user.rows[0].password,
                },
                jwt_key,
                { expiresIn: 1800 } //30 минут
            ),
            refresh_token: faker.finance.bitcoinAddress(),
        };

        //обновляем refresh_token в БД
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
            res.status(500).json(); //проблема с подключением к БД
            return;
        }

        //выводим сообщение об успехе и возвращаем новые токены
        console.log("Success!".green);
        res.status(200).json(newTokens); //всё хорошо
    }

    async getUserPublicInformation(req, res) {
        //защита от вылета
        if (req.body.access_token === undefined) {
            req.body.access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                "Get user with access token = " +
                req.body.access_token.bgGray.hidden
        );

        //проверяем access_token на валидность
        try {
            //если токен невалидный, то jwt.verify вызовет ошибку
            let userDecoded = jwt.verify(req.body.access_token, jwt_key);

            let user;

            //получаем публичные данные
            try {
                user = await db.query(
                    `SELECT nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );
            } catch (err) {
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //проверка на нахождение пользователя в БД
            if (user.rowCount) {
                console.log("Success!".green);
                res.status(200).json(user.rows[0]); //всё хорошо
            } else {
                console.log("Failure!".red);
                res.status(404).json(); //пользователь с таким токеном не существует
            }
        } catch (err) {
            console.log("Failure!".red);
            res.status(401).json(); //токен недействителен
            return;
        }
    }

    async updateUserInformation(req, res) {
        //защита от вылета
        if (req.body.access_token === undefined) {
            req.body.access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                "Get user with access token = " +
                req.body.access_token.bgGray.hidden
        );

        //проверяем access_token на валидность
        try {
            //если токен невалидный, то jwt.verify вызовет ошибку
            let userDecoded = jwt.verify(req.body.access_token, jwt_key);

            let parsedInfo;

            if (req.body.password !== undefined) {
                parsedInfo += {
                    "password": req.body.password
                }
            }

            if (req.body.about !== undefined) {
                parsedInfo += {
                    "about": req.body.about
                }
            }

            let user;

            //получаем публичные данные
            try {
                user = await db.query(
                    `SELECT nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );
            } catch (err) {
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //проверка на нахождение пользователя в БД
            if (user.rowCount) {
                console.log("Success!".green);
                res.status(200).json(user.rows[0]); //всё хорошо
            } else {
                console.log("Failure!".red);
                res.status(404).json(); //пользователь с таким токеном не существует
            }
        } catch (err) {
            console.log("Failure!".red);
            res.status(401).json(); //токен недействителен
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
