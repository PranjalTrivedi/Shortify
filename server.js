const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "src", "locales", "users.json");

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, "/")));

// Utility function to read user data
const readUsersData = (callback) => {
  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return callback({ error: "Unable to read users data." }, null);

    try {
      const parsedData = JSON.parse(data);
      if (!Array.isArray(parsedData.users))
        throw new Error("Users data is not an array");
      callback(null, parsedData.users);
    } catch (error) {
      callback({ error: "Invalid users data format." }, null);
    }
  });
};

// Utility function to write user data
const writeUsersData = (users, callback) => {
  fs.writeFile(
    USERS_FILE,
    JSON.stringify({ users }, null, 2),
    "utf8",
    (err) => {
      if (err) return callback({ error: "Unable to save users data." });
      callback(null);
    }
  );
};

// News fetching API with filtering support
app.get("/news", (req, res) => {
  const category = req.query.category ? req.query.category.toLowerCase() : null;
  const keyword = req.query.keyword ? req.query.keyword.toLowerCase() : null;

  fs.readFile(
    path.join(__dirname, "src", "locales", "news.json"),
    "utf8",
    (err, data) => {
      if (err)
        return res.status(500).json({ error: "Unable to fetch news data." });

      try {
        let newsData = JSON.parse(data).news;

        if (category) {
          newsData = newsData.filter((article) =>
            article.category.toLowerCase().includes(category)
          );
        }

        if (keyword) {
          newsData = newsData.filter(
            (article) =>
              article.title.toLowerCase().includes(keyword) ||
              article.description.toLowerCase().includes(keyword)
          );
        }

        res.json(newsData);
      } catch (error) {
        res.status(500).json({ error: "Error processing news data." });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Get users
app.get("/users", (req, res) => {
  readUsersData((error, users) => {
    if (error) return res.status(500).json(error);
    res.json(users);
  });
});

// Add or update user
app.post("/users", (req, res) => {
  const userData = req.body;

  readUsersData((error, users) => {
    if (error) return res.status(500).json(error);

    const userIndex = users.findIndex(
      (user) => user.userId === userData.userId
    );
    if (userIndex > -1) {
      users[userIndex] = userData; // Update existing user
    } else {
      users.push(userData); // Add new user
    }

    writeUsersData(users, (error) => {
      if (error) return res.status(500).json(error);
      res.json({ message: "User data saved successfully." });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
