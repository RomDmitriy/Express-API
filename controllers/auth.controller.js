import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwt_key } from "../private-info.js";
import faker from "faker";
import { getCurrTime, getCurrDateTime } from "../times.js";
import "colors";

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
            let tokens = {
                access_token: jwt.sign(
                    { login: req.body.login, password: secPass },
                    jwt_key,
                    { expiresIn: 1800 } //30 минут
                ),
                refresh_token: faker.finance.bitcoinAddress(),
            };

            //отправляем запрос на добавление пользователя
            while (true) {
                try {
                    await db.query(
                        `INSERT INTO Auth (login, nickname, password, last_login_utc, refreshtoken, register_utc) VALUES (
                            '${req.body.login}', '${
                            req.body.login
                        }', '${secPass}', '${getCurrDateTime()}', '${
                            tokens.refresh_token
                        }', '${getCurrDateTime()}');`
                    );
                } catch (err) {
                    //обработка когда refresh_token уже занят
                    if (
                        err.detail !== undefined &&
                        err.detail.includes("refreshtoken")
                    ) {
                        console.log("Refresh token already exists :)".yellow);
                        tokens.refresh_token = faker.finance.bitcoinAddress();
                        continue;
                    }

                    //если БД легла
                    if (err.errno === -4078) {
                        console.log("Failure!".red);
                        console.log(
                            "Warning!  Database is not avaliable!".bgYellow.bold
                                .black
                        );
                        res.status(500).json(); //проблема с подключением к БД
                        return;
                    }
                    console.log("Failure!".red);
                    res.status(409).json(); //пользователь уже существует
                    return;
                }

                //возвращаем токены и сообщение об успехе
                console.log("Success!".green);
                res.status(201).json(tokens); //всё хорошо
                return;
            }
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
                console.log("Failure!".red);
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

                //отправляем новый refresh_token и last_login_utc в БД
                while (true) {
                    try {
                        await db.query(
                            `UPDATE Auth SET refreshtoken = '${
                                newTokens.refresh_token
                            }', last_login_utc = '${getCurrDateTime()}' WHERE login = '${
                                req.body.login
                            }'`
                        );
                    } catch (err) {
                        //обработка когда refresh_token уже занят
                        if (
                            err.detail !== undefined &&
                            err.detail.includes("refreshtoken")
                        ) {
                            console.log(
                                "Refresh token already exists :)".yellow
                            );
                            tokens.refresh_token =
                                faker.finance.bitcoinAddress();
                            continue;
                        }
                        console.log("Failure!".red);
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
                    return;
                }
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
            console.log("Failure!".red);
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
        while (true) {
            try {
                await db.query(
                    `UPDATE Auth SET refreshtoken = '${
                        newTokens.refresh_token
                    }', last_login_utc = '${getCurrDateTime()}' WHERE refreshtoken = '${
                        req.body.refresh_token
                    }'`
                );
            } catch (err) {
                //обработка когда refresh_token уже занят
                if (
                    err.detail !== undefined &&
                    err.detail.includes("refreshtoken")
                ) {
                    console.log("Refresh token already exists :)".yellow);
                    tokens.refresh_token = faker.finance.bitcoinAddress();
                    continue;
                }
                console.log("Failure!".red);
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //выводим сообщение об успехе и возвращаем новые токены
            console.log("Success!".green);
            res.status(200).json(newTokens); //всё хорошо
            return;
        }
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
                    `SELECT nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc, to_char(register_utc, 'DD.MM.YYYY HH24:MI:SS') as register_utc FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );
            } catch (err) {
                console.log("Failure!".red);
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
                return;
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

    async resetPassword(req, res) {
        //защита от вылета
        let login = req.body.login;
        if (login === undefined) {
            login = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                "Refresh password of user with login = " +
                login.bgGray.hidden
        );

        //защита от плохого запроса
        if (
            req.body.login !== undefined ||
            req.body.new_password !== undefined
        ) {
            let user;
            try {
                user = await db.query(
                    `Select login FROM Auth WHERE login = '${req.body.login}'`
                );
            } catch (err) {
                console.log("Failure!".red);
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //если пользователь найден
            if (user.rowCount) {
                //шифруем пароль
                const secPass = bcrypt.hashSync(
                    req.body.new_password,
                    bcrypt.genSaltSync(10)
                );

                try {
                    await db.query(
                        `UPDATE Auth SET password = '${secPass}' WHERE login = '${req.body.login}'`
                    );
                    console.log("Success!".green);
                    res.status(200).json();
                } catch (err) {
                    console.log("Failure!".red);
                    console.log(
                        "Warning!  Database is not avaliable!".bgYellow.bold
                            .black
                    );
                    res.status(500).json(); //проблема с подключением к БД
                    return;
                }
            }
            //если такого пользователя нет
            else {
                console.log("Failure!".red);
                res.status(404).json(); //пользователь с таким логином не найден
            }
        } else {
            console.log("Failure!".red);
            res.status(400).json(); //плохой запрос
        }
    }

    //REQUEST DEPRECATED
    // async updateUserInformation(req, res) {
    //     //защита от вылета
    //     if (req.body.access_token === undefined) {
    //         req.body.access_token = "undefined";
    //     }

    //     //логирование
    //     console.log();
    //     console.log(
    //         (" " + getCurrTime() + " ").bgWhite.black +
    //             "Get user with access token = " +
    //             req.body.access_token.bgGray.hidden
    //     );

    //     //проверяем access_token на валидность
    //     try {
    //         //если токен невалидный, то jwt.verify вызовет ошибку
    //         let userDecoded = jwt.verify(req.body.access_token, jwt_key);

    //         let parsedInfo;

    //         if (req.body.password !== undefined) {
    //             parsedInfo += {
    //                 password: req.body.password,
    //             };
    //         }

    //         if (req.body.about !== undefined) {
    //             parsedInfo += {
    //                 about: req.body.about,
    //             };
    //         }

    //         let user;

    //         //получаем публичные данные
    //         try {
    //             user = await db.query(
    //                 `SELECT nickname, about, avatar_url, to_char(last_login_utc, 'DD.MM.YYYY HH24:MI:SS') as last_login_utc FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
    //             );
    //         } catch (err) {
    //             console.log("Failure!".red);
    //             console.log(
    //                 "Warning!  Database is not avaliable!".bgYellow.bold.black
    //             );
    //             res.status(500).json(); //проблема с подключением к БД
    //             return;
    //         }

    //         //проверка на нахождение пользователя в БД
    //         if (user.rowCount) {
    //             console.log("Success!".green);
    //             res.status(200).json(user.rows[0]); //всё хорошо
    //             return;
    //         } else {
    //             console.log("Failure!".red);
    //             res.status(404).json(); //пользователь с таким токеном не существует
    //         }
    //     } catch (err) {
    //         console.log("Failure!".red);
    //         res.status(401).json(); //токен недействителен
    //         return;
    //     }
    // }

    async deleteUser(req, res) {
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

            //получаем публичные данные
            try {
                const query = await db.query(
                    `DELETE FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );

                //если пользователь был найден и удалён
                if (query.rowCount > 0) {
                    console.log("Success!".green);
                    res.status(200).json(); //всё хорошо
                    return;
                //если пользователь не найден
                } else {
                    console.log("Failure!".red);
                    res.status(404).json(); //пользователь с таким токеном не найден
                    return;
                }
            } catch (err) {
                console.log("Failure!".red);
                console.log(
                    "Warning!  Database is not avaliable!".bgYellow.bold.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }
        } catch (err) {
            console.log("Failure!".red);
            res.status(401).json(); //токен недействителен
            return;
        }
    }
}
