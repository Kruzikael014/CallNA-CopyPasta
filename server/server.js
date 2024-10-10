require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const sql = require('mssql')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true
  }
}

const migrate = async () => {
  const query = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='messages' AND xtype='U')
      CREATE TABLE [messages] (
          message_id UNIQUEIDENTIFIER PRIMARY KEY,
          content NVARCHAR(MAX) NOT NULL,
          created_at DATETIME DEFAULT GETDATE() NOT NULL,
          deleted_at DATETIME DEFAULT NULL
      );
  `;
  try {
    await sql.query(query);
    console.log("Table 'Messages' is ready.");
  } catch (err) {
    console.error('Error creating table:', { isSuccess: false, error: err.message });
  }
};

sql.connect(dbConfig).then(async pool => {
  if (pool.connected) {
    console.log("Connected to the database.");
    await migrate();
  }
}).catch(err => console.error('Database connection failed:', err));


app.get('/messages', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Messages WHERE deleted_at IS NULL');
    res.json({ isSuccess: true, obj: result.recordset });
  } catch (err) {
    res.status(500).send({ isSuccess: false, error: err.message });
  }
});

app.post('/messages', async (req, res) => {
  const { content } = req.body;
  try {
    await sql.query`INSERT INTO Messages (message_id, content) VALUES (NEWID(), ${content})`;
    res.status(201).send({ isSuccess: true, error: null });
  } catch (err) {
    res.status(500).send({ isSuccess: false, error: err.message });
  }
});

app.delete('/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`UPDATE dbo.[messages] SET deleted_at = GETDATE() WHERE message_id = ${id}`;
    if (result.rowsAffected[0] > 0) {
      res.status(200).send({ isSuccess: true, error: null });
    } else {
      res.status(404).send({ isSuccess: false, error: 'Message cannot be found!' });
    }
  } catch (err) {
    res.status(500).send({ isSuccess: false, error: err.message });
  }
});

app.listen(process.env.SERVER_PORT)