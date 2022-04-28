import pkg from "pg";
const { Pool } = pkg;
import { db_ip, db_name, db_pass, db_port, db_user } from "../security_config.js";

const db = new Pool({
    user: db_user,
    password: db_pass,
    host: db_ip,
    port: db_port,
    database: db_name,
});

export default db;