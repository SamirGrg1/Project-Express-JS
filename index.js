// Importing required modules
const express = require('express');
const fs = require('fs');
const app = express();
const port = 8000;

// Importing MOCK_DATA.json file
const users = require('./MOCK_DATA.json');

// Middleware for parsing JSON (required for POST and PATCH)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom middleware to log a message for every request
app.use((req, res, next) => {
    console.log("hello from middleware");
    next();
});

// Custom middleware to log a message for every request
app.use((req, res, next) => {
    fs.appendFile('task.txt',`${Date.now()}: ${req.method} ${req.path}\n`,(err)=>{
       console.log("hello from middleware2");
        next();
    })
    
});

// GET route to retrieve all users
app.get('/users', (req, res) => {
    const html = `
      <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join('')}
      </ul>
    `;
    res.send(html);
});

// GET route to retrieve all users in JSON format
app.get('/api/users', (req, res) => {
    res.setHeader("X-MyName","krishna");
    return res.json(users);
});

// Route for handling users by ID
app.route('/api/users/:id')
    .get((req, res) => {
        
        // Retrieving user by ID
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (!user) {
            // Return 404 error if user not found
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    })
    .patch((req, res) => {
        // Updating user by ID
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (!user) {
            // Return 404 error if user not found
            return res.status(404).json({ error: 'User not found' });
        }
        // Updating user fields
        const { first_name, last_name, email, gender, job_title } = req.body;
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (job_title) user.job_title = job_title;
        // Writing updated users array to file
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
            return res.json({ status: 'success', id });
        });
    })
    .delete((req, res) => {
        // Deleting user by ID
        const id = Number(req.params.id);
        const index = users.findIndex((user) => user.id === id);
        if (index !== -1) {
            users.splice(index, 1);
            // Writing updated users array to file
            fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    return res.status(500).json({ status: 'error', message: 'Failed to delete user' });
                }
                // Success response after writing to file
                return res.json({ status: 'success', message: 'User deleted', id });
            });
        } else {
            // Return 404 error if user not found
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
    });

// POST route to add a new user
app.post('/api/users', (req, res) => {
    const body = req.body;

    if(!body || !body.first_name || !body.last_name || !body.gender || !body.email || !body.job_title){
        return res.status(400).json({msg: "All data are required"})
    }

    // Adding new user with a unique ID
    users.push({ ...body, id: users.length + 1 });

    // Writing updated users array to file
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        return res.json({ status: 'success', id: users.length });
    });
});

// Starting the server
app.listen(port, () => {
    console.log(`Server started at port=${port}`);
});