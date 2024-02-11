// Серверная часть страницы
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");

// Инициализация Пользователя
const User = require("./model/User");

const app = express();
mongoose.connect("mongodb+srv://Nurzhakhan:nuke@cluster.tin7ue1.mongodb.net/");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "default",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(express.json());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Домашняя страница
app.get("/", (req, res) => {
    res.render("home");
});

// Страница регистрации
app.get("/register", (req, res) => {
    res.render("register");
});

// Обработка регистрации
app.post("/register", async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
            return res.send("<script>alert('Username and password cannot be empty.'); window.history.back();</script>");
        }

        if (password.length < 8) {
            return res.send("<script>alert('Password must be at least 8 characters long.'); window.history.back();</script>");
        }
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            console.log("User already is in database");
            return res.send("<script>alert('User already is in database'); window.history.back();</script>");
        }

        const newUser = await User.create({ username, password });
        res.redirect("logged");
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Страница логина
app.get("/login", (req, res) => {
    res.render("login", { errorMessage: "" });
});

// Обработка Логина
app.post("/login", async function(req, res){
	try {
		const user = await User.findOne({ username: req.body.username });
		if (user) {
		const result = req.body.password === user.password;
            if (result && user.isAdmin) {
                res.render("admin")
            }
            else {
                res.render("logged");
            }
		} else {
		res.render("login", { errorMessage: "Please check the username and password fields, because there is no such username in a database" });
		}
	} catch (error) {
		res.status(400).json({ error });
	}
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { username, password }, // Ensure password is hashed if necessary
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Страница для зарегестрированного пользователя
app.get("/logged", isLogged, (req, res) => {
    res.render("logged");
});

// Выход
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Получение информации касательно пользователей с базы данных
app.post('/api/users', async (req, res) => {
    try {
        let { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            console.log("User already is in database");
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            username: req.body.username,
            password: req.body.password
        });

    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.delete('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOneAndDelete({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

function isLogged(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
