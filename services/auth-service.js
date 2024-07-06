const express = require("express");
const router = express.Router();
const db = require("../db"); // Import the database functions
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  generatePassword,
  sendPasswordEmail,
} = require("../utils/passwordUtils.js");

// Signup endpoint
router.post("/signup", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    position,
    department,
    date_of_hire,
    address,
    phone_number,
    salary,
    leave_balance,
    dob,
    role,
  } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({error: "Email and password are required"});
  }

  try {
    // Check if the email is already registered
    let existingUser = await db.executeQuery(
      "SELECT * FROM employees WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({error: "Email already exists"});
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database with hashed password
    await db.executeQuery(
      "INSERT INTO employees (first_name, last_name, email, password, position, department, date_of_hire, address, phone_number, salary, leave_balance, dob, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name,
        email,
        hashedPassword, // Store hashed password in the database
        position,
        department,
        date_of_hire,
        address,
        phone_number,
        salary,
        leave_balance,
        dob,
        role,
      ]
    );

    return res.status(201).json({message: "Employee registered successfully"});
  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({error: "Internal server error"});
  }
});

// Login endpoint
// Import JWT library

router.post("/login", async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({error: "Email and password are required"});
  }

  try {
    // Fetch user with the provided email from the database
    let user = await db.executeQuery(
      "SELECT * FROM employees WHERE email = ?",
      [email]
    );
    if (!user || user.length === 0) {
      return res.status(401).json({error: "Invalid email or password"});
    }

    // Compare hashed password from database with the provided password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({error: "Invalid email or password"});
    }

    // Generate a JWT token with user information (including role)
    const payload = {
      userId: user[0].id,
      email: user[0].email,
      role: user[0].role, // Assuming "role" field exists in the user table
    };
    const secret = process.env.JWT_SECRET; // Replace with your JWT secret stored in an environment variable
    const token = jwt.sign(payload, secret, {expiresIn: "1m"}); // Set an expiration time for the token

    // Respond with success message, user data (excluding password), and token
    const sanitizedUser = {...user[0]};
    delete sanitizedUser.password; // Remove password from response
    return res
      .status(200)
      .json({message: "Login successful", user: payload, token});
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({error: "Internal server error"});
  }
});

// Route for forgetting password
router.post("/forgot-password", async (req, res) => {
  const {email} = req.body;

  try {
    // Check if the user exists
    const userQuery = `SELECT * FROM employees WHERE email = ?`;
    let [users] = await db.executeQuery(userQuery, [email]);

    if (!users || users.length === 0) {
      return res.status(404).json({message: "User not found"});
    }

    // Generate a new password
    const newPassword = generatePassword(); // You need to define this function

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updatePasswordQuery = `UPDATE employees SET password = ? WHERE email = ?`;
    await db.executeQuery(updatePasswordQuery, [hashedPassword, email]);

    // Send the new password to the user's email
    await sendPasswordEmail(email, newPassword); // You need to define this function

    res.status(200).json({message: "New password sent successfully"});
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

module.exports = router;
