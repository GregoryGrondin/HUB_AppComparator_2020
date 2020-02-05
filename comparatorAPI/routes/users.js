var express = require('express');
var router = express.Router();
var pg = require('pg');

const config = {
    user: 'postgres',
    database: 'postgres',
    password: 'password',
    host: process.env.DB_HOST,
    port: 5432
};

var client = new pg.Pool(config);

createTable("CREATE TABLE IF NOT EXISTS users(user_id serial PRIMARY KEY, username VARCHAR (50) UNIQUE NOT NULL, password VARCHAR (50) NOT NULL)");

function createTable(table) {
  client.query(table, [], function (err, result) {
    if (err) {
      console.log(err.stack)
      createTable()
    }
  });
}

router.get('/register', function(req, res) {
  var checkQuery = "SELECT * FROM users WHERE username=$1";
  var checkValue = [req.query.username]
  client.query(checkQuery, checkValue, function(err, result) {
    if (err) {
      console.log(err);
      res.json({"status": "error", "data": "Internal error", "code": 500});
      return;
    }
    if (!result.rows.length) {
      var insertQuery = "INSERT INTO users(username, password) VALUES ($1, $2)";
      var insertValues = [req.query.username, req.query.password];
      client.query(insertQuery, insertValues, function(err, result) {
        if (err) {
          console.log(err);
          res.json({"status": "error", "data": "Internal error", "code": 500});
          return;
        }
        res.json({"status": "OK", "data": {"state": "User successfully inserted to the database."}, "code": 201})
        return;
      });
    } else
      res.json({"status": "error", "data": {"error": "Username: " + req.query.username + " already in use."}, "code": 400});
      return;
  });
});

router.get('/login', function(req, res) {
  var getQuery = "SELECT * FROM users WHERE username=$1";
  var getValue = [req.query.username]
  client.query(getQuery, getValue, function (err, result) {
    if (err) {
      console.log(err)
      res.json({"status": "error", "data": "Internal error", "code": 500});
      return;
    }
    if (!result.rows.length) {
      res.json({"status": "error", "data": {"state": "Wrong credentials."}, "code": 400});
      return;
    } else if (result.rows[0].password === req.query.password) {
      res.json({"status": "OK", "data": {"state": "Connection successful."}, "code": 200});
      return;
    } else
      res.json({"status": "error", "data": {"state": "Wrong credentials."}, "code": 400})
      return;
  });
});
module.exports = router;
