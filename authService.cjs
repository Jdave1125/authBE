// authService.js

const bcrypt = require('bcrypt');

const { Pool } = require('pg');


// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: 'postgres://zzjysktx:Nf2xuxK2zc4XRCrUiuIqyyrBFp9Sh0Pp@ruby.db.elephantsql.com/zzjysktx',
  ssl: {
    rejectUnauthorized: false
  }
});

const authService = {
  register: async (username, password) => {
    try {
      // Check if the username already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length > 0) {
        throw new Error('Username already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

      return { username };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  login: async (username, password) => {
    try {
      // Find the user in the database
      const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }

      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!passwordMatch) {
        throw new Error('Invalid credentials');
      }

      return { username };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = authService;
