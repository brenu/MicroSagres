const pgp = require("pg-promise")({});

const cn = `postgresql://${process.env.db_user}:${process.env.db_pass}@localhost:5432/projeto_bd2`;

const db = pgp(cn);

module.exports = db;
