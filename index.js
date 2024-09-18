const express = require('express');
const fs = require('fs');
const app = express();
const port = 8000;
const users = require('./MOCK_DATA.json');

// Middleware for parsing JSON (required for POST and PATCH)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/users', (req, res) => {
    const html = `
      <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join('')}
      </ul>
    `;
    res.send(html);
});

app.get('/api/users', (req, res) => {
    return res.json(users);
});

// Route for handling users by ID
app.route('/api/users/:id')
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Assuming you want to update some fields
        const { first_name, last_name, email,gender,job_title} = req.body;
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (email) user.email = email;
        if(gender) user.gender=gender;
        if(job_title) user.job_title=job_title;
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
            return res.json({ status: 'success',id });
        });
    })
    
    .delete((req, res) => {
        // Return "pending" status
        const id=Number(req.params.id);
        const index = users.findIndex((user) => user.id === id);
        if (index !== -1) {
            users.splice(index, 1);
            fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    return res.status(500).json({ status: 'error', message: 'Failed to delete user' });
                }
    
                // Success response after writing to file
                return res.json({ status: 'success', message: 'User deleted', id });
            });
        } else {
            // If user not found, return a 404 error
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
            });
            

// POST route to add a new user
app.post('/api/users', (req, res) => {
    const body = req.body;

    // Add new user with a unique ID
    users.push({ ...body, id: users.length + 1 });

    // Write updated users array to file
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        return res.json({ status: 'success', id:users.length });
    });
});

app.listen(port, () => {
    console.log(`Server started at port=${port}`);
});
