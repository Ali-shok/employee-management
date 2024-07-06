const express = require("express");
const router = express.Router();
const db = require("../db"); // Assuming you have a database module
const ExcelJS = require("exceljs");

// CREATE operation - Add a new salary record
router.post("/salaries", async (req, res) => {
  const {employee_name, base_salary, bonus, deduction, payout_date} = req.body;

  try {
    // Fetch the employee's ID based on their name
    const resultEmployee = await db.executeQuery(
      "SELECT id FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?",
      [employee_name]
    );

    if (!resultEmployee || resultEmployee.length === 0) {
      return res.status(404).json({error: "Employee not found"});
    } else if (resultEmployee.length > 1) {
      // Optional handling for duplicate names (e.g., return 400 with a specific message)
      console.warn(
        "Multiple employees found with the same name:",
        employee_name
      );
      return res.status(400).json({error: "Duplicate employee names found"}); // Or provide more specific details
    }

    const employeeId = resultEmployee[0].id;

    const result = await db.executeQuery(
      "INSERT INTO salaries (employee_id, base_salary, bonus, deduction, payout_date) VALUES (?, ?, ?, ?, ?)",
      [employeeId, base_salary, bonus, deduction, payout_date]
    );

    res.status(201).json({
      message: "Salary record created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating salary record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// READ operation - Get all salary records
router.get("/salaries", async (req, res) => {
  try {
    const salaries = await db.executeQuery(`
        SELECT 
          salaries.id,
          employees.first_name,
          employees.last_name,
          salaries.base_salary,
          salaries.bonus,
          salaries.deduction,
          salaries.payout_date
        FROM 
          salaries
        JOIN 
          employees ON salaries.employee_id = employees.id
      `);

    res.json(salaries);
  } catch (error) {
    console.error("Error fetching salary records:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

router.get("/employee-salaries", async (req, res) => {
  try {
    let salaries = await db.executeQuery(`
        SELECT 
          salaries.id,
          employees.first_name,
          employees.last_name,
          salaries.base_salary,
          salaries.bonus,
          salaries.deduction,
          salaries.payout_date
        FROM 
          salaries
        JOIN 
          employees ON salaries.employee_id = employees.id
      `);

    res.json(salaries);
  } catch (error) {
    console.error("Error fetching salary records:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// READ operation - Get salary record by ID

router.get("/salaries/:id", async (req, res) => {
  const {id} = req.params;

  try {
    const salary = await db.executeQuery(
      `SELECT s.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
       FROM salaries s
       JOIN employees e ON s.employee_id = e.id
       WHERE s.employee_id = ?
       ORDER BY s.id DESC
       LIMIT 1`,
      [id]
    );

    if (salary) {
      res.json(salary[0]);
    } else {
      res.status(404).json({message: "Salary record not found"});
    }
  } catch (error) {
    console.error("Error fetching salary record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// UPDATE operation - Update salary record by ID
router.put("/salaries/:id", async (req, res) => {
  const {id} = req.params;
  const {base_salary, bonus, deduction, payout_date} = req.body;

  try {
    await db.executeQuery(
      "UPDATE salaries SET base_salary = ?, bonus = ?, deduction = ?, payout_date = ? WHERE id = ?",
      [base_salary, bonus, deduction, payout_date, id]
    );

    res.json({message: "Salary record updated successfully"});
  } catch (error) {
    console.error("Error updating salary record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// DELETE operation - Delete salary record by ID
router.delete("/salaries/:id", async (req, res) => {
  const {id} = req.params;

  try {
    await db.executeQuery("DELETE FROM salaries WHERE id = ?", [id]);
    res.json({message: "Salary record deleted successfully"});
  } catch (error) {
    console.error("Error deleting salary record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

router.get("/export-salaries", async (req, res) => {
  try {
    // Fetch salary information along with employee names from the database (same logic as before)
    const salariesWithEmployeeNames = await db.executeQuery(`
     select
        salaries.id,
        employees.first_name,
        employees.last_name,
        salaries.base_salary,
        salaries.bonus,
        salaries.deduction,
        salaries.payout_date
      from
        salaries
      join
        employees ON salaries.employee_id = employees.id
    `);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Salaries");

    // Define the headers for the Excel file
    worksheet.columns = [
      {header: "ID", key: "id", width: 10},
      {header: "First Name", key: "first_name", width: 20},
      {header: "Last Name", key: "last_name", width: 20},
      {header: "Base Salary", key: "base_salary", width: 15},
      {header: "Bonus", key: "bonus", width: 15},
      {header: "Deduction", key: "deduction", width: 15},
      {header: "Payout Date", key: "payout_date", width: 20},
    ];

    worksheet.columns[6].numberFormat = "yyyy-mm-dd";

    // Add the data to the worksheet
    salariesWithEmployeeNames.forEach((salary) => {
      worksheet.addRow({
        id: salary.id,
        first_name: salary.first_name,
        last_name: salary.last_name,
        base_salary: salary.base_salary,
        bonus: salary.bonus,
        deduction: salary.deduction,
        payout_date: salary.payout_date,
      });
    });

    // Generate a unique filename for the Excel file
    const fileName = `salaries_${new Date().toISOString()}.xlsx`;

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Multiple options for sending the response:

    // Option 1: Using writeBuffer (may offer more control)
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);

    // Option 2: Using write (default behavior)
    // await workbook.xlsx.write(res);
    // res.end();
  } catch (error) {
    console.error("Error exporting salaries:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

module.exports = router;
