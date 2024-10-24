import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: mysql.Pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234567',
    database: process.env.DB_NAME || 'easyrice',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log('Database connection pool created successfully.');
} catch (error) {
  console.error('Error creating database connection pool:', (error as Error).message);
  process.exit(1);
}

export default pool;
