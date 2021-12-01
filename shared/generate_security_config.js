import fs from 'fs';

fs.open('security_config.js', 'w', (err) => {
    if(err) throw err;
    console.log('File created!');
});

fs.appendFile('security_config.js', `export const jwt_key = "your_jwt_key";

export const db_ip = "database_ip";
export const db_user = "database_username";
export const db_pass = "database_password";
export const db_port = 5432; //number, not string!
export const db_name = "database_name";`, (err) => {
    if(err) throw err;
    console.log('Data has been added!');
});