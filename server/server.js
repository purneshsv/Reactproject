const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;
const FLASK_API_URL = "http://localhost:5001/api";

app.use(cors());
app.use(bodyParser.json());

// Middleware to handle API token
const handleToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    req.headers["Authorization"] = token;
  }
  next();
};

app.use(handleToken);

// Login route
app.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API_URL}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Login error:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Server error" });
  }
});

// Google authentication route
app.post("/auth/google", async (req, res) => {
  try {
    // Check if this is a simulator test
    if (req.body.simulatorTest) {
      console.log("Simulator testing mode detected, forwarding to Flask backend");
    } else {
      console.log("Regular Google Sign-In request received");
    }
    
    // Forward the request to the Flask backend
    const response = await axios.post(`${FLASK_API_URL}/auth/google`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Google auth error:", error.message);
    res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || { message: "Google authentication failed" }
      );
  }
});

// Get all employees
app.get("/employees", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_URL}/employees`, {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Get employees error:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Server error" });
  }
});

// Add new employee
app.post("/employees", async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API_URL}/employees`, req.body, {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Add employee error:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Server error" });
  }
});

// Update employee
app.put("/employees/:id", async (req, res) => {
  try {
    const response = await axios.put(
      `${FLASK_API_URL}/employees/${req.params.id}`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Update employee error:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Server error" });
  }
});

// Delete employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const response = await axios.delete(
      `${FLASK_API_URL}/employees/${req.params.id}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Delete employee error:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js middleware server running on port ${PORT}`);
});
