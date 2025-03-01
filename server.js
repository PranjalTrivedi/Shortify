const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '/')));

app.get('/users', (req, res) => {
    fs.readFile(path.join(__dirname, 'src', 'locales', 'users.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read users data.' });
      }
  
      let users;
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        
        users = parsedData.users; 
        if (!Array.isArray(users)) {
          throw new Error('Users data is not an array');
        }
      } catch (error) {
        return res.status(500).json({ error: 'Invalid users data format.' });
      }
  
      res.json(users);
    });
  });
  
  app.post('/users', (req, res) => {
    const userData = req.body;
  
    fs.readFile(path.join(__dirname, 'src', 'locales', 'users.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read users data.' });
      }
  
      let users;
      try {
        const parsedData = JSON.parse(data);
        users = parsedData.users; 
        if (!Array.isArray(users)) {
          throw new Error('Users data is not an array');
        }
      } catch (error) {
        return res.status(500).json({ error: 'Invalid users data format.' });
      }
  
      const userIndex = users.findIndex(user => user.userId === userData.userId);
  
      if (userIndex > -1) {
        users[userIndex] = userData;
      } else {
        users.push(userData);
      }
  
  
      fs.writeFile(path.join(__dirname, 'src', 'locales', 'users.json'), JSON.stringify({ users }, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Unable to save users data.' });
        }
        res.json({ message: 'User data saved successfully.' });
      });
    });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
