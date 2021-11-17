import e from "express";
import db from "../db.js";

export class UserController {

    async createUser(req, res) {
        //validator
        if (req.body.login.length > 3 && req.body.login.length < 33
            && req.body.pass.length > 5 && req.body.pass.length < 33) {

            const user = await db.query(`SELECT id FROM Auth WHERE login = $1;`, [req.body.login]);
            if (!user.rowCount) {
                await db.query(`INSERT INTO Auth (login, password) VALUES ($1, $2);`, [req.body.login, req.body.pass]);
                res.json(true);
            }
            else {
                res.json(false);
            }

        }
        else {
            res.json(false);
        }
    }

    async getUser(req, res) {
        if (req.params.id != null) {
            const user = await db.query(`SELECT login, about, avatarurl, to_char(lastloginutc, 'DD.MM.YYYY HH24:MI:SS') as lastLoginUTC, roomlist FROM Auth WHERE id = $1;`, [req.params.id]);
            res.json(user.rows[0]);
        }
        else {
            return(false);
        }
    }

    async getUserQuery(req, res) {
        let query = new Array();

        if (req.params.query.includes("login")) {
            query.push("login");
        }
        if (req.params.query.includes("about")) {
            query.push("about");
        }
        if (req.params.query.includes("avatarurl")) {
            query.push("avatarurl");
        }
        if (req.params.query.includes("lastloginutc")) {
            query.push("lastloginutc");
        }
        if (req.params.query.includes("roomlist")) {
            query.push("roomlist");
        }

        query = query.join(', ');

        let id = req.params.id;
        const user = await db.query(`SELECT ${query} FROM Auth WHERE id = ${id};`);
        if (user.rowCount) {
            res.json(user.rows[0]);
        }
        else {
            res.json(false);
        }
    }

    async check(req, res) {
        if (req.body.login != null && req.body.pass != null) {
            const user = await db.query(`SELECT id AS ID FROM Auth WHERE login = $1 AND password = $2;`, [req.body.login, req.body.pass]);
            if (user.rowCount) {
                let data = new Date();
                await db.query(`UPDATE Auth SET lastloginutc = $1 WHERE id = $2;`, [
                    data.getUTCFullYear() + '-' + (data.getUTCMonth() + 1) + '-' +
                    data.getUTCDate() + ' ' + data.getUTCHours() +
                    ':' + data.getUTCMinutes() + ':' + data.getUTCSeconds(),
                user.rows[0].id]);
                res.json(true);
            }
            else {
                res.json(false);
            }
        }
        else {
            res.json(false);
        }
    }

    async updatePassword(req, res) {
        await db.query(`UPDATE Auth SET password = $1 WHERE id = $2;`, [req.body.password, req.body.id]);
        res.json(true);
    }

    async updateAvatar(req, res) {
        await db.query(`UPDATE Auth SET avatarurl = $1 WHERE id = $2;`, [req.body.avatarURL, req.body.id]);
        res.json(true);
    }

    //а нужна ли здесь проверка на наличие юзера в бд?
    async deleteUser(req, res) {
        const delUser = await db.query(`SELECT id AS ID FROM Auth WHERE id = $1`, [req.body.id]);
        if (delUser.rowCount) {
            console.log("Delete user with id = " + req.body.id);
            await db.query(`DELETE FROM Apartments WHERE owner_id = $1;`, [req.body.id]);
            await db.query(`DELETE FROM Auth WHERE id = $1;`, [req.body.id]);
            res.json(true);
        }
        else {
            res.json(false);
        }
    }
}