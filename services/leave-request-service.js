const express = require("express");
const router = express.Router();
const db = require("../db");

// Get vacation balance for the current year

router.get("/leave/balance/:employeeId", async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    // Implement logic to calculate vacation balance based on the employeeId
    const vacationBalance = await calculateVacationBalance(employeeId);
    res.json(vacationBalance);
  } catch (error) {
    console.error("Error fetching vacation balance:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Submit leave requests for employee
router.post("/leave/requests/:employeeId", async (req, res) => {
  try {
    const {start_date, end_date, reason} = req.body;
    const employeeId = req.params.employeeId;

    // Implement logic to save leave requests to the database
    await db.executeQuery(
      "INSERT INTO leave_requests (employee_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)",
      [employeeId, start_date, end_date, reason]
    );
    res.status(201).json({message: "Leave request submitted successfully"});
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Admin: Get all leave requests
router.get("/leave/requests", async (req, res) => {
  try {
    const leaveRequests = await db.executeQuery(`
      SELECT 
        lr.id,
        lr.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status
      FROM 
        leave_requests lr
      JOIN 
        employees e ON lr.employee_id = e.id
    `);

    // Fetch leave balance for each employee
    for (let request of leaveRequests) {
      const balance = await calculateVacationBalance(request.employee_id);
      request.balance = balance;
    }

    res.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Admin: Approve or reject leave requests
router.put("/leave/requests/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;
    // Implement logic to update leave requests status
    await db.executeQuery("UPDATE leave_requests SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    res.json({message: "Leave request status updated successfully"});
  } catch (error) {
    console.error("Error updating leave requests status:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

router.delete("/leave/requests/:id", async (req, res) => {
  try {
    const {id} = req.params;

    // Implement logic to delete the leave request
    await db.executeQuery("DELETE FROM leave_requests WHERE id = ?", [id]);

    res.json({message: "Leave request deleted successfully"});
  } catch (error) {
    console.error("Error deleting leave request:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// New route to fetch leave requests for a specific employee by ID
router.get("/leave/requests/:employeeId", async (req, res) => {
  const {employeeId} = req.params;

  try {
    const leaveRequests = await db.executeQuery(
      `
      SELECT 
        lr.id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status 
      FROM 
        leave_requests lr
      JOIN 
        employees e ON lr.employee_id = e.id
      WHERE 
        e.id = ?
        ORDER BY
        lr.id DESC
    `,
      [employeeId]
    );

    res.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

const calculateVacationBalance = async (employeeId) => {
  try {
    // Determine the start and end dates of the current year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Retrieve all leave requests for the employee within the current year
    const leaveRequests = await db.executeQuery(
      "SELECT start_date, end_date FROM leave_requests WHERE employee_id = ? AND start_date >= ? AND end_date <= ? AND status = 'approved'",
      [employeeId, startDate, endDate]
    );

    // Calculate total leave days requested
    let totalLeaveDays = 0;
    if (leaveRequests.length > 0) {
      leaveRequests.forEach((leave) => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        totalLeaveDays += diffDays;
      });
    }

    // Calculate remaining vacation balance
    const maxVacationDays = 28;
    const remainingBalance = maxVacationDays - totalLeaveDays;

    // Ensure the remaining balance is not negative
    return Math.max(remainingBalance, 0);
  } catch (error) {
    console.error("Error calculating vacation balance:", error);
    throw error;
  }
};

module.exports = router;
