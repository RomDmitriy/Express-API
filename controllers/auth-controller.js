import e from "express";
import db from "../db.js";

export class UserController {

    async createUser(req, res) {
        const newUser = await db.query(`INSERT INTO Auth (login, password) VALUES ($1, $2);`, [req.body.login, req.body.password]);
        if (newUser.rows.length != 0) {
            res.json(false);
        }
        else {
            res.json(true);
        }
    }

    async getUser(req, res) {
        const user = await db.query(`SELECT login, about, avatarurl, lastloginutc FROM Auth WHERE id = $1;`, [req.params.id]);
        res.json(user.rows[0]);
    }

    async check(req, res) {
        const user = await db.query(`SELECT id FROM Auth WHERE login = $1 AND password = $2;`, [req.body.login, req.body.password]);
        if (user.rows.length != 0) {
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

    async updatePassword(req, res) {
        await db.query(`UPDATE Auth SET password = $1 WHERE id = $2;`, [req.body.password, req.body.id]);
        res.json(true);
    }

    async updateAvatar(req, res) {
        
        await db.query(`UPDATE Auth SET avatarurl = $1 WHERE id = $2;`, [req.body.avatarURL, req.body.id]);
        res.json(true);
    }

    async deleteUser(req, res) {
        const delUser = await db.query(`SELECT id FROM auth WHERE id = $1`, [req.body.id]);
        if (delUser.rows.length != 0){
            console.log("Delete user with id = " + req.body.id);
            await db.query(`DELETE FROM Auth WHERE id = $1;`, [req.body.id]);
            res.json(true);
        }
        else {
            res.json(false);
        }
    }
}