import db from "../../shared/database.js";
import jwt from "jsonwebtoken";
import { base_avatar, jwt_key } from "../../security_config.js";
import faker from "faker";
import { getCurrTime, getCurrDateTimeInSeconds } from "../../shared/times.js";
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
                login
        );

        //валидация длин данных
        if (req.body.login?.length > 3 &&
            req.body.login?.length < 33 &&
            req.body.password?.length > 5 &&
            req.body.password?.length < 33
        ) {
            //генерируем токены
            let tokens = {
                access_token: jwt.sign(
                    { login: req.body.login, password: req.body.password },
                    jwt_key,
                    { expiresIn: 1800 } //30 минут
                ),
                refresh_token: faker.finance.bitcoinAddress(),
            };

            //отправляем запрос на добавление пользователя
            while (true) {
                try {
                    await db.query(
                        `INSERT INTO Auth (login, nickname, password, last_login, refresh_token, register_time, avatar_url) VALUES (
                            '${req.body.login}', 
                            '${req.body.login}', 
                            '${req.body.password}', 
                            ${getCurrDateTimeInSeconds()},
                            '${tokens.refresh_token}', 
                            ${getCurrDateTimeInSeconds()},
                            '${base_avatar}'
                        );`
                    );
                } catch (err) {
                    //обработка когда refresh_token уже занят
                    if (
                        err.detail !== undefined &&
                        err.detail.includes("refresh_token")
                    ) {
                        console.log("Refresh token already exists :)".yellow);
                        tokens.refresh_token = faker.finance.bitcoinAddress();
                        continue;
                    }

                    //если БД легла
                    if (err.errno === -4078) {
                        console.log("Failure! Status code: 500".red);
                        console.log(
                            "Warning! Database is unavaliable!".bgYellow
                                .black
                        );
                        res.status(500).json(); //проблема с подключением к БД
                        return;
                    }
                    console.log("Failure! Status code: 409 (User already exists)".red);
                    res.status(409).json(); //пользователь уже существует
                    return;
                }

                //возвращаем токены и сообщение об успехе
                console.log("Success! Status code: 201".green);
                res.status(201).json(tokens); //всё хорошо
                return;
            }
        } else {
            console.log("Failure! Status code: 400 (Bad request)".red);
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
                login
        );

        //защита от пустых логина или пароля
        if (req.body?.login != null && req.body?.password != null) {
            let user;

            //пробуем найти пользователя с таким логином
            try {
                user = await db.query(
                    `SELECT password FROM Auth WHERE login = '${req.body.login}';`
                );
            } catch (err) {
                console.log("Failure! Status code: 500".red);
                console.log(
                    "Warning! Database is unavaliable!".bgYellow.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //если пользователь не найден
            if (!user.rowCount) {
                console.log("Failure! Status code: 404 (User not found)".red);
                res.status(404).json(); //пользователь не найден
                return;
            }

            //если пользователь найден, то сравниваем пароли
            if (req.body.password === user.rows[0].password) {
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

                //отправляем новый refresh_token и last_login в БД
                while (true) {
                    try {
                        await db.query(
                            `UPDATE Auth SET refresh_token = '${newTokens.refresh_token}', 
                            last_login = '${getCurrDateTimeInSeconds()}' WHERE login = '${req.body.login}';`
                        );
                    } catch (err) {
                        //обработка когда refresh_token уже занят
                        if (
                            err.detail !== undefined &&
                            err.detail.includes("refresh_token")
                        ) {
                            console.log(
                                "Refresh token already exists :)".yellow
                            );
                            tokens.refresh_token =
                                faker.finance.bitcoinAddress();
                            continue;
                        }
                        console.log("Failure! Status code: 500".red);
                        console.log(
                            "Warning! Database is unavaliable!".bgYellow
                                .black
                        );
                        res.status(500).json(); //проблема с подключением к БД
                        return;
                    }

                    //выводим сообщение об успехе и возвращаем новые токены
                    console.log("Success! Status code: 200".green);
                    res.status(200).json(newTokens); //всё хорошо
                    return;
                }
            }
            //если неправильный пароль
            else {
                console.log("Failure! Status code: 401 (Wrong password)".red);
                res.status(401).json(); //неправильный пароль
            }
        }
        //если неправильный запрос
        else {
            console.log("Failure! Status code: 400 (Bad request)".red);
            res.status(400).json(); //неправильный запрос
        }
    }

    async userAuthorizationToken(req, res) {
        //защита от вылета
        let access_token = req.headers.authorization;
        if (access_token === undefined) {
            access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Auth user with access token = " +
                access_token
        );

        //защита от пустого токена
        if (req.headers.authorization === undefined) {
            console.log("Failure! Status code: 401 (Wrong request)".red);
            res.status(400).json(); //неправильный запрос
            return;
        }

        try {
            //если токен невалидный, то jwt.verify вызовет ошибку
            let userDecoded = jwt.verify(access_token, jwt_key);

            let userPassword;

            //пробуем найти пользователя с таким логином
            try {
                userPassword = await db.query(
                    `SELECT password FROM Auth WHERE login = '${userDecoded.login}';`
                );
            } catch (err) {
                console.log("Failure! Status code: 500".red);
                console.log(
                     "Warning! Database is unavaliable!".bgYellow
                        .black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //если пользователь не найден
            if (!userPassword.rowCount) {
                console.log("Failure! Status code: 404 (User not found)".red);
                res.status(404).json(); //пользователь не найден
                 return;
            }

            //если пользователь найден, то сравниваем пароли
            if (userDecoded.password === userPassword.rows[0].password) {
                //отправляем новый last_login в БД
                while (true) {
                    try {
                        await db.query(
                            `UPDATE Auth SET last_login = '${getCurrDateTimeInSeconds()}' 
                            WHERE login = '${req.body.login}'`
                        );
                    } catch (err) {
                        console.log("Failure! Status code: 500".red);
                        console.log(
                            "Warning! Database is unavaliable!".bgYellow
                                .bold.black
                        );
                        res.status(500).json(); //проблема с подключением к БД
                        return;
                    }

                    //выводим сообщение об успехе
                    console.log("Success! Status code: 200".green);
                    res.status(200).json(); //всё хорошо
                    return;
                }
            }
            //если неправильный пароль
            else {
                console.log("Failure! Status code: 401 (Wrong password)".red);
                res.status(401).json(); //неправильный пароль
                return;
            }
        } catch (err) {
            //если токен недействителен
            console.log("Failure! Status code: 401 (Token expired)".red);
            res.status(401).json(); //токен недействителен
            return;
        }
    }

    async getNewJWTtokens(req, res) {
        //защита от вылета
        let access_token = req.body.refresh_token;
        if (access_token === undefined) {
            access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Update token for user with refresh token = " +
                access_token
        );

        //защита от плохого запроса
        if (req.body.refresh_token === null) {
            console.log("Failure! Status code: 400 (Bad request)".red);
            res.status(400).json(); //плохой запрос
            return;
        }

        let user;

        //ищем нужного пользователя
        try {
            user = await db.query(
                `SELECT login, password FROM Auth WHERE refresh_token = '${access_token}'`
            );
        } catch (err) {
            console.log("Failure! Status code: 500".red);
            console.log(
                "Warning! Database is unavaliable!".bgYellow.black
            );
            res.status(500).json(); //проблема с подключением к БД
            return;
        }

        //если пользователя с таким токеном нет
        if (!user.rowCount) {
            console.log("Failure! Status code: 404 (User not found)".red);
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
                    `UPDATE Auth SET refresh_token = '${newTokens.refresh_token}', 
                    last_login = '${getCurrDateTimeInSeconds()}' 
                    WHERE refresh_token = '${access_token}'`
                );
            } catch (err) {
                //обработка когда refresh_token уже занят
                if (
                    err.detail !== undefined &&
                    err.detail.includes("refresh_token")
                ) {
                    console.log("Refresh token already exists :)".yellow);
                    tokens.refresh_token = faker.finance.bitcoinAddress();
                    continue;
                }
                console.log("Failure! Status code: 500".red);
                console.log(
                    "Warning! Database is unavaliable!".bgYellow.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //выводим сообщение об успехе и возвращаем новые токены
            console.log("Success! Status code: 200".green);
            res.status(200).json(newTokens); //всё хорошо
            return;
        }
    }

    async getUserPublicInformation(req, res) {
        //защита от вылета
        let access_token = req.headers.authorization;
        if (req.headers.authorization === undefined) {
            access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Get user with access token = " +
                access_token
        );

        //проверяем access_token на валидность
        try {
            //если токен невалидный, то jwt.verify вызовет ошибку
            let userDecoded = jwt.verify(access_token, jwt_key);

            let user;

            //получаем публичные данные
            try {
                user = await db.query(
                    `SELECT nickname, about, avatar_url, last_login, register_time FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );
            } catch (err) {
                console.log("Failure! Status code: 500".red);
                console.log(
                    "Warning! Database is unavaliable!".bgYellow.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //проверка на нахождение пользователя в БД
            if (user.rowCount) {
                console.log("Success! Status code: 200".green);
                res.status(200).json(user.rows[0]); //всё хорошо
                return;
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
                " Refresh password of user with login = " +
                login
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
                console.log("Failure! Status code: 500".red);
                console.log(
                    "Warning! Database is unavaliable!".bgYellow.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //если пользователь найден
            if (user.rowCount) {
                //обновляем пароль в БД
                try {
                    await db.query(
                        `UPDATE Auth SET password = '${req.body.password}' WHERE login = '${req.body.login}'`
                    );
                    console.log("Success! Status code: 200".green);
                    res.status(200).json();
                } catch (err) {
                    console.log("Failure! Status code: 500".red);
                    console.log(
                        "Warning! Database is unavaliable!".bgYellow
                            .black
                    );
                    res.status(500).json(); //проблема с подключением к БД
                    return;
                }
            }
            //если такого пользователя нет
            else {
                console.log("Failure! Status code: 404 (User not found)".red);
                res.status(404).json(); //пользователь с таким логином не найден
            }
        } else {
            console.log("Failure! Status code: 400 (Bad request)".red);
            res.status(400).json(); //плохой запрос
        }
    }

    async changeUserInformation(req, res) {
        //защита от вылета
        let access_token = req.headers.authorization;
        if (req.headers.authorization === undefined) {
            access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Get user with access token = " +
                access_token
        );

        //проверяем access_token на валидность
        try {
            //если токен невалидный, то jwt.verify вызовет ошибку
            const userDecoded = jwt.verify(access_token, jwt_key);

            //ищем нужного пользователя
            try {
                var userPassword = await db.query(
                    `SELECT password FROM Auth WHERE login = '${userDecoded.login}'`
                );
            } catch (err) {
                console.log("Failure! Status code: 500".red);
                console.log(
                    "Warning! Database is unavaliable!".bgYellow.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }

            //если пользователь не найден
            if (!userPassword.rowCount) {
                console.log("Failure! Status code: 404 (User not found)".red);
                res.status(404).json(); //пользователь не найден
                return;
            }

            //если пользователь найден, то сравниваем пароли
            if (userDecoded.password === userPassword.rows[0].password) {
                //объект под переданные поля
                var parsedInfo = {};

                //парсинг смены ника (не логина!)
                parsedInfo.nickname = req.body.nickname;

                //парсинг смены пароля
                if (req.body.password !== undefined) {
                    //передаём в БД зашифрованный пароль
                    parsedInfo.password = req.body.password;

                    //генерируем новые токены
                    var newTokens = {
                        access_token: jwt.sign(
                            {
                                login: userDecoded.login,
                                password: req.body.password,
                            },
                            jwt_key,
                            { expiresIn: 1800 } //30 минут
                        ),
                        refresh_token: faker.finance.bitcoinAddress(),
                    };

                    //добавляем новый refresh_token в запрос для обновления оного в БД
                    parsedInfo.refresh_token = newTokens.refresh_token;
                }

                //парсинг смены информации о себе
                parsedInfo.about = req.body.about;

                //парсинг смены аватарки
                parsedInfo.avatar_url = req.body.avatar_url;

                //парсинг id вопроса
                parsedInfo.question_id = req.body.question_id;

                //парсинг ответа на вопрос
                parsedInfo.question_answer = req.body.question_answer;

                //чистка от undefined
                parsedInfo = JSON.parse(JSON.stringify(parsedInfo));

                //массив обновляемых полей
                let request = [];

                //преобразование объекта в массив
                for (let key in parsedInfo) {
                    request.push(key + " = '" + parsedInfo[key] + "'");
                }

                //объединение в строку
                request = request.join(", ");

                //отправляем запрос в БД
                try {
                    await db.query(
                        `UPDATE Auth SET ${request} WHERE login = '${userDecoded.login}';`
                    );
                    console.log("Success! Status code: 200".green);
                    res.status(200).json(newTokens); //всё хорошо
                    return;
                } catch (err) {
                    console.log("Failure! Status code: 500".red);
                    console.log(
                        "Warning! Database is unavaliable!".bgYellow
                            .black
                    );
                    res.status(500).json(); //проблема с подключением к БД
                    return;
                }
            }
            //если неправильный пароль
            else {
                console.log("Failure! Status code: 401 (Wrong password)".red);
                res.status(401).json(); //неправильный пароль
                return;
            }
        } catch (err) {
            console.log("Failure! Status code: 401 (Token expired)".red);
            res.status(401).json(); //токен недействителен
            return;
        }
    }

    async deleteUser(req, res) {
        //защита от вылета
        let access_token = req.headers.authorization;
        if (req.headers.authorization === undefined) {
            access_token = "undefined";
        }

        //логирование
        console.log();
        console.log(
            (" " + getCurrTime() + " ").bgWhite.black +
                " Delete user with access token = " +
                access_token
        );

        //проверяем access_token на валидность
        try {
            //если токен невалидный, то jwt.verify вызовет ошибку
            let userDecoded = jwt.verify(access_token, jwt_key);

            //получаем публичные данные
            try {
                const query = await db.query(
                    `DELETE FROM Auth WHERE login = '${userDecoded.login}' and password = '${userDecoded.password}';`
                );

                //если пользователь был найден и удалён
                if (query.rowCount > 0) {
                    console.log("Success! Status code: 200".green);
                    res.status(200).json(); //всё хорошо
                    return;
                    //если пользователь не найден
                } else {
                    console.log("Failure! Status code: 404 (User not found)".red);
                    res.status(404).json(); //пользователь с таким токеном не найден
                    return;
                }
            } catch (err) {
                console.log("Failure! Status code: 500".red);
                console.log(
                    "Warning! Database is unavaliable!".bgYellow.black
                );
                res.status(500).json(); //проблема с подключением к БД
                return;
            }
        } catch (err) {
            console.log("Failure! Status code: 401 (Token expired)".red);
            res.status(401).json(); //токен недействителен
            return;
        }
    }
}
