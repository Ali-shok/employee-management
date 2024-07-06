const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// Create an employee
router.post("/employees", async (req, res) => {
  try {
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

    // Check if the email already exists in the database
    const emailCheckResult = await db.executeQuery(
      "SELECT * FROM employees WHERE email = ?",
      [email]
    );

    if (emailCheckResult.length > 0) {
      // Email already exists
      return res.status(400).json({error: "Email already exists"});
    }
    let hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new employee into the database
    const result = await db.executeQuery(
      "INSERT INTO employees (first_name, last_name, email, password, position, department, date_of_hire, address, phone_number, salary, leave_balance, dob, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name,
        email,
        hashedPassword,
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

    res.status(201).json({
      message: "Employee created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Get all employees
router.get("/employees", async (req, res) => {
  try {
    // Fetch all employees from the database
    const employees = await db.executeQuery("SELECT * FROM employees");

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Get an employee by ID
router.get("/employees/:id", async (req, res) => {
  try {
    const {id} = req.params;

    // Fetch the employee by ID from the database
    const [employee] = await db.executeQuery(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );

    if (!employee) {
      return res.status(404).json({error: "Employee not found"});
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({error: "Internal server error"});
  }
});
// Get all employees who role = employee

router.get("/employees/role/employee", async (req, res) => {
  try {
    // Fetch employees with role 'employee' from the database
    const employees = await db.executeQuery(
      "SELECT * FROM employees WHERE role = 'employee'"
    );
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees with role 'employee':", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Update an employee by ID
router.put("/employees/:id", async (req, res) => {
  try {
    const {id} = req.params;
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

    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Retrieve the current password from the database if not provided
      const currentPasswordResult = await db.executeQuery(
        "SELECT password FROM employees WHERE id = ?",
        [id]
      );
      if (currentPasswordResult.length > 0) {
        hashedPassword = currentPasswordResult[0].password;
      } else {
        return res.status(404).json({error: "Employee not found"});
      }
    }

    // Check if the email already exists in the database for a different employee
    const emailCheckResult = await db.executeQuery(
      "SELECT * FROM employees WHERE email = ? AND id != ?",
      [email, id]
    );

    if (emailCheckResult.length > 0) {
      // Email already exists for a different employee
      return res.status(400).json({error: "Email already exists"});
    }

    // Update the employee in the database
    await db.executeQuery(
      "UPDATE employees SET first_name = ?, last_name = ?, email = ?, password = ?, position = ?, department = ?, date_of_hire = ?, address = ?, phone_number = ?, salary = ?, leave_balance = ?, dob = ?, role = ? WHERE id = ?",
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        position,
        department,
        date_of_hire,
        address,
        phone_number,
        salary,
        leave_balance,
        dob,
        role,
        id,
      ]
    );

    res.status(200).json({message: "Employee updated successfully"});
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Delete an employee by ID
router.delete("/employees/:id", async (req, res) => {
  try {
    const {id} = req.params;

    // Delete the employee from the database
    await db.executeQuery("DELETE FROM employees WHERE id = ?", [id]);

    res.status(200).json({message: "Employee deleted successfully"});
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

module.exports = router;
