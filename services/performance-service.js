const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE operation - Add a new performance record
router.post("/performance", async (req, res) => {
  try {
    const {employee_id, review_date, performance_rating, notes} = req.body;

    const result = await db.executeQuery(
      "INSERT INTO performance (employee_id, review_date, performance_rating, notes) VALUES (?, ?, ?, ?)",
      [employee_id, review_date, performance_rating, notes]
    );

    res.status(201).json({
      message: "Performance record created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating performance record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// READ operation - Get all performance records
router.get("/performance", async (req, res) => {
  try {
    const performanceRecords = await db.executeQuery(`
        SELECT 
          p.id, 
          p.employee_id,
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
          p.review_date,
          p.performance_rating,
          p.notes
        FROM 
          performance p
        JOIN 
          employees e ON p.employee_id = e.id
      `);

    res.json(performanceRecords);
  } catch (error) {
    console.error("Error fetching performance records:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// READ operation - Get performance record by ID
router.get("/performance/:id", async (req, res) => {
  const {id} = req.params;

  try {
    const performanceRecord = await db.executeQuery(
      `SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name 
       FROM performance p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.employee_id = ?
       ORDER BY p.id DESC
       LIMIT 1`,
      [id]
    );

    if (performanceRecord) {
      res.json(performanceRecord[0]);
    } else {
      res.status(404).json({message: "Performance record not found"});
    }
  } catch (error) {
    console.error("Error fetching performance record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// UPDATE operation - Update performance record by ID
router.put("/performance/:id", async (req, res) => {
  const {id} = req.params;
  const {employee_id, review_date, performance_rating, notes} = req.body;

  try {
    await db.executeQuery(
      "UPDATE performance SET employee_id = ?, review_date = ?, performance_rating = ?, notes = ? WHERE id = ?",
      [employee_id, review_date, performance_rating, notes, id]
    );

    res.json({message: "Performance record updated successfully"});
  } catch (error) {
    console.error("Error updating performance record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// DELETE operation - Delete performance record by ID
router.delete("/performance/:id", async (req, res) => {
  const {id} = req.params;

  try {
    await db.executeQuery("DELETE FROM performance WHERE id = ?", [id]);
    res.json({message: "Performance record deleted successfully"});
  } catch (error) {
    console.error("Error deleting performance record:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

module.exports = router;
