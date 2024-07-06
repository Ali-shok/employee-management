const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config(); // Load environment variables from .env file

// Create a MySQL pool using environment variables
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Function to execute SQL queries
async function executeQuery(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err; // Re-throw the error for handling in the calling function
  }
}

// Function to create database if it doesn't exist
async function createDatabase() {
  try {
    const createDatabaseSQL =
      "CREATE DATABASE IF NOT EXISTS " + process.env.DB_DATABASE;
    await executeQuery(createDatabaseSQL);
    console.log("Database created or already exists");
  } catch (error) {
    throw new Error("Error creating database: " + error.message);
  }
}

// Function to create tables if they don't exist
async function createTables() {
  // SQL query to create the employees table
  const createEmployeesTableSQL = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL ,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        position VARCHAR(100),
        department VARCHAR(100),
        date_of_hire DATE,
        address TEXT,
        phone_number VARCHAR(15),
        salary DECIMAL(10,2) DEFAULT 0.00,
        leave_balance INT DEFAULT 0,
        dob DATE,
        role VARCHAR(100) NULL DEFAULT 'employee',
        PRIMARY KEY (id)
      )
    `;

  // SQL query to create the HR table
  const createHrTableSQL = `
      CREATE TABLE IF NOT EXISTS hr (
        ID INT NOT NULL,
        NAME TEXT,
        EMAIL TEXT,
        PRIMARY KEY (ID)
      )
    `;

  // SQL query to create the leave_requests table
  const createLeaveRequestsTableSQL = `
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT NOT NULL AUTO_INCREMENT,
        employee_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        PRIMARY KEY (id),
        KEY (employee_id),
        CONSTRAINT FK_employee_id FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `;

  // SQL query to create the performance table
  const createPerformanceTableSQL = `
      CREATE TABLE IF NOT EXISTS performance (
        id INT NOT NULL AUTO_INCREMENT,
        employee_id INT NOT NULL,
        review_date DATE,
        performance_rating ENUM('bad', 'good', 'excellent') DEFAULT 'good',
        notes TEXT,
        PRIMARY KEY (id),
        KEY (employee_id),
        CONSTRAINT FK_employee_id_performance FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `;

  // SQL query to create the salaries table
  const createSalariesTableSQL = `
      CREATE TABLE IF NOT EXISTS salaries (
        id INT NOT NULL AUTO_INCREMENT,
        employee_id INT NOT NULL,
        base_salary DECIMAL(10,2),
        bonus DECIMAL(10,2) DEFAULT 0.00,
        deduction DECIMAL(10,2) DEFAULT 0.00,
        payout_date DATE ,
        PRIMARY KEY (id),
        KEY (employee_id),
        CONSTRAINT FK_employee_id_salaries FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `;

  try {
    // Execute each SQL query to create tables
    await executeQuery(createEmployeesTableSQL);
    console.log("Employees table created successfully");
    await executeQuery(createHrTableSQL);
    console.log("HR table created successfully");
    await executeQuery(createLeaveRequestsTableSQL);
    console.log("Leave requests table created successfully");
    await executeQuery(createPerformanceTableSQL);
    console.log("Performance table created successfully");
    await executeQuery(createSalariesTableSQL);
    console.log("Salaries table created successfully");
  } catch (err) {
    // Handle errors if any query fails
    console.error("Error creating tables:", err);
  }
}

async function insertSampleHrData() {
  // SQL query to check if HR data already exists
  const checkHrDataSQL = `SELECT COUNT(*) AS count FROM hr`;

  try {
    // Execute the query to check the count of HR records
    const results = await executeQuery(checkHrDataSQL);
    const hrCount = results[0].count;

    // If HR data already exists, skip insertion
    if (hrCount > 0) {
      console.log("HR data already exists, skipping insertion");
      return;
    }

    // SQL query to insert sample HR data
    const insertHrDataSQL = `
          INSERT INTO hr (ID, NAME, EMAIL) VALUES
          (1234, 'Salma', 'Salma@gmail.com'),
          (1235, 'Rawya', 'rawya@gmail.com'),
          (1236, 'Heba', 'heba@gmail.com'),
          (1237, 'Shaimaa', 'shaimaa@gmail.com')
        `;

    // Execute the query to insert sample HR data
    await executeQuery(insertHrDataSQL);
    console.log("Sample HR data inserted successfully");
  } catch (err) {
    console.error("Error inserting sample HR data:", err);
  }
}

module.exports = {
  executeQuery,
  createDatabase,
  createTables,
  insertSampleHrData,
  pool,
};
