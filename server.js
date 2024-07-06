const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db"); // Assuming a shared location for db.js
const authService = require("./services/auth-service");
const salaryService = require("./services/salary-service");
const employeeService = require("./services/employee-management-service");
const performanceService = require("./services/performance-service");
const leaveRequestService = require("./services/leave-request-service");
const cors = require("cors");
require("dotenv").config();

// Function to initialize the database (optional)
async function initializeDatabase() {
  try {
    await db.createDatabase();
    console.log("Database created (if it did not exist)");
    await db.createTables();
    console.log("Tables created");
    await db.insertSampleHrData(); // Optional: Insert sample data
    console.log("Sample HR data inserted (if it did not exist)");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1); // Exit the process on error
  }
}

initializeDatabase();

// Create separate Express instances for each service
const authApp = express();
const salaryApp = express();
const employeeApp = express();
const performanceApp = express();
const leaveRequestApp = express();

// Enable CORS for all apps
authApp.use(cors());
salaryApp.use(cors());
employeeApp.use(cors());
performanceApp.use(cors());
leaveRequestApp.use(cors());

// Middleware for both services
authApp.use(express.urlencoded({extended: true}));
authApp.use(bodyParser.json());

salaryApp.use(express.urlencoded({extended: true}));
salaryApp.use(bodyParser.json());

employeeApp.use(express.urlencoded({extended: true}));
employeeApp.use(bodyParser.json());

performanceApp.use(express.urlencoded({extended: true}));
performanceApp.use(bodyParser.json());

leaveRequestApp.use(express.urlencoded({extended: true}));
leaveRequestApp.use(bodyParser.json());

// Assuming your services export functionality like routers or middleware:

authApp.use("/", authService); // Assuming authService returns middleware or routes

salaryApp.use("/", salaryService); // Assuming salaryService returns middleware or routes

employeeApp.use("/", employeeService); // Assuming salaryService returns middleware or routes

performanceApp.use("/", performanceService); // Assuming performanceService returns middleware or routes

leaveRequestApp.use("/", leaveRequestService); // Assuming leaveRequestService returns middleware or routes

// Start the authentication service
authApp.listen(process.env.PORT_AUTH, () => {
  console.log(
    `Authentication service running on port ${process.env.PORT_AUTH}` || 3001
  );
});

// Start the salary service
salaryApp.listen(process.env.PORT_SALARY, () => {
  console.log(
    `Salary service running on port ${process.env.PORT_SALARY}` || 3002
  );
});

employeeApp.listen(process.env.PORT_EMPLOYEE, () => {
  console.log(
    `Employee service running on port ${process.env.PORT_EMPLOYEE}` || 3003
  );
});

performanceApp.listen(process.env.PORT_PERFORMANCE, () => {
  console.log(
    `Performance service running on port ${process.env.PORT_PERFORMANCE}` ||
      3004
  );
});

leaveRequestApp.listen(process.env.PORT_LEAVEREQUEST, () => {
  console.log(
    `Leave Request service running on port ${process.env.PORT_LEAVEREQUEST}` ||
      3005
  );
});
