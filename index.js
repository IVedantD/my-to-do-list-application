const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Ensure "tasks" directory exists
const tasksDir = path.join(__dirname, 'tasks');
if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir);
}

// Homepage: Display tasks
app.get('/', (req, res) => {
    fs.readdir(tasksDir, (err, files) => {
        if (err) return res.status(500).send("Error reading tasks directory.");
        const tasks = files.map(file => ({
            title: file.replace('.txt', ''),
            content: fs.readFileSync(path.join(tasksDir, file), 'utf-8')
        }));
        res.render('index', { tasks });
    });
});

// Add a new task
app.post('/create', (req, res) => {
    const title = req.body.title.trim().split(' ').join('_');
    const content = req.body.details.trim();
    const filePath = path.join(tasksDir, `${title}.txt`);
    fs.writeFile(filePath, content, (err) => {
        if (err) return res.status(500).send("Error creating task.");
        res.redirect('/');
    });
});

// View task details
app.get('/read/:title', (req, res) => {
    const title = req.params.title;
    const filePath = path.join(tasksDir, `${title}.txt`);
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) return res.status(404).send("Task not found.");
        res.render('read', { title, content });
    });
});

// Edit task
app.get('/edit/:title', (req, res) => {
    const title = req.params.title;
    const filePath = path.join(tasksDir, `${title}.txt`);
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) return res.status(404).send("Task not found.");
        res.render('edit', { title, content });
    });
});

app.post('/edit/:title', (req, res) => {
    const oldTitle = req.params.title;
    const newTitle = req.body.title.trim().split(' ').join('_');
    const content = req.body.details.trim();
    const oldFilePath = path.join(tasksDir, `${oldTitle}.txt`);
    const newFilePath = path.join(tasksDir, `${newTitle}.txt`);

    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) return res.status(500).send("Error updating task title.");
        fs.writeFile(newFilePath, content, (err) => {
            if (err) return res.status(500).send("Error updating task content.");
            res.redirect('/');
        });
    });
});

// Delete task
app.post('/delete/:title', (req, res) => {
    const title = req.params.title;
    const filePath = path.join(tasksDir, `${title}.txt`);
    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).send("Error deleting task.");
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
