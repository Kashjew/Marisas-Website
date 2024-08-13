const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { exec } = require('child_process');  // Import child_process to run scripts
const MongoStore = require('connect-mongo');  // MongoDB session store
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up express session with MongoDB store
app.use(session({
    secret: '17c4733d378cc84b0923047fdf5e4cf79cba9861a0398470317054440f411e23ab0d3c9019deab94d43821ee9114ad10c52c7b63ebd0088a3516ce9463aa3174', // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://yegorkushnir1:PeJZb9PQdtgPPGN1@cluster0.i1gq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        ttl: 14 * 24 * 60 * 60 // Optional: set session expiry (in seconds)
    })
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Single hardcoded user
const user = {
    id: 1,
    username: 'sushiluvsu',
    password: bcrypt.hashSync('marisa123', 10) // Store hashed password
};

// Set up Passport Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
    if (username !== user.username) {
        return done(null, false, { message: 'Incorrect username.' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    if (user.id === id) {
        done(null, user);
    } else {
        done(new Error("User not found"));
    }
});

// Authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('Unauthorized');
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files from the "public", "uploads", "css", "js", and "assets" directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// JSON file to store posts
const postsFilePath = path.join(__dirname, 'posts.json');

// Helper function to load posts from the JSON file
function loadPosts() {
    if (fs.existsSync(postsFilePath)) {
        const data = fs.readFileSync(postsFilePath);
        return JSON.parse(data);
    }
    return [];
}

// Helper function to save posts to the JSON file
function savePosts(posts) {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
}

// Helper function to run the backup script
function runBackupScript() {
    exec('node backupPosts.mjs', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running backup script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Backup script stderr: ${stderr}`);
            return;
        }
        console.log(`Backup script stdout: ${stdout}`);
    });
}

// Load existing posts
let posts = loadPosts();

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

// Handle logout
app.post('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');  // Redirect to the homepage after logging out
    });
});

// API route to check if the user is authenticated
app.get('/api/check-auth', (req, res) => {
    res.json({ loggedIn: req.isAuthenticated() });
});

// Handle POST requests for creating a new post (secured route)
app.post('/api/posts', ensureAuthenticated, upload.array('images', 5), (req, res) => { // allow up to 5 images
    const { title, content, recipe, instagramLink } = req.body;
    console.log("Received Instagram Link:", instagramLink); // Log the Instagram link
    const imagePaths = req.files.map(file => '/' + file.path.replace(/\\/g, '/'));  // Ensure the path works on all platforms

    const post = {
        id: Date.now(),
        title,
        content,
        imagePaths,
        recipe,
        instagramLink: instagramLink || '' // Store the Instagram link or an empty string if not provided
    };

    console.log("Creating Post:", post); // Log the post being created

    posts.unshift(post);  // Add the new post to the front of the array
    savePosts(posts);  // Save the updated posts array to the JSON file

    // Run the backup script after creating a post
    runBackupScript();

    res.status(200).json(post);
});

// Handle GET requests to load all posts
app.get('/api/posts', (req, res) => {
    console.log("Fetching Posts:"); // Log when posts are being fetched
    res.json(posts);
});

// Handle DELETE requests for removing a post (secured route)
app.delete('/api/posts/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    console.log("Deleting Post with ID:", id); // Log the ID of the post being deleted
    const postIndex = posts.findIndex(p => p.id === parseInt(id));

    if (postIndex >= 0) {
        const [post] = posts.splice(postIndex, 1);
        post.imagePaths.forEach(imagePath => {
            fs.unlinkSync(path.join(__dirname, imagePath));  // Remove the image files
        });
        savePosts(posts);  // Save the updated posts array to the JSON file

        // Run the backup script after deleting a post
        runBackupScript();

        res.status(200).json({ message: 'Post deleted successfully' });
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

// Handle PUT requests for editing a post (secured route)
app.put('/api/posts/:id', ensureAuthenticated, upload.array('images', 5), (req, res) => {
    const { id } = req.params;
    const { title, content, recipe, instagramLink } = req.body;
    console.log("Editing Post with ID:", id); // Log the ID of the post being edited
    console.log("New Instagram Link:", instagramLink); // Log the new Instagram link

    const postIndex = posts.findIndex(p => p.id === parseInt(id));

    if (postIndex >= 0) {
        const post = posts[postIndex];

        post.title = title;
        post.content = content;
        post.recipe = recipe;
        post.instagramLink = instagramLink || '';

        console.log("Updated Post:", post); // Log the updated post

        if (req.files.length > 0) {
            post.imagePaths.forEach(imagePath => {
                fs.unlinkSync(path.join(__dirname, imagePath));  // Remove the old image files
            });
            post.imagePaths = req.files.map(file => '/' + file.path.replace(/\\/g, '/'));
        }

        savePosts(posts);  // Save the updated posts array to the JSON file

        // Run the backup script after editing a post
        runBackupScript();

        res.status(200).json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
