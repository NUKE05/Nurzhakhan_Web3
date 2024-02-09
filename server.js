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
        let { username, password } = req.body;
        let user = await User.register(new User({ username }), password);
        passport.authenticate("local")(req, res, () => {
            res.redirect("/logged");
        });
    } catch (error) {
        res.redirect("/register");
    }
});

// Страница логина
app.get("/login", (req, res) => {
    res.render("login");
});

// Обработка Логина
app.post("/login", passport.authenticate("local", {
    successRedirect: "/logged",
    failureRedirect: "/login"
}));

// Страница для зарегестрированного пользователя
app.get("/logged", isLogged, (req, res) => {
    res.render("logged");
});

// Выход
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLogged(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
