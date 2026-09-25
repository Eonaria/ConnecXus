const mysql = require("mysql2/promise");
async function run() {
  const c = await mysql.createConnection({host:"localhost", user:"root", database:"connecxus"});
  const [r] = await c.query("SELECT * FROM user_followers");
  console.log(r);
  c.end();
}
run();
