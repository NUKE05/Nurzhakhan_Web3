// Серверная часть страницы
const express = require("express");
const axios = require('axios');
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const apiKey = 'ab27b7d7268cc3b21b2656fff829ba04';

// Инициализация Пользователя
const User = require("./model/User");
const Weather = require("./model/Weather");
const Country = require('./model/Country');
const News = require('./model/News')

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

        const newUser = new User({ username: username, password: password });

        await User.register(newUser, password);
        req.login(newUser, (err) => {
            if (err) {
                console.error('Error during login after registration:', err);
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
            }
            return res.redirect("/logged");
        });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Страница логина
app.get("/login", (req, res) => {
    res.render("login", { errorMessage: "" });
});

app.get("/logged", isLogged, (req, res) => {
    res.render("logged");
});

// Обработка Логина
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', { errorMessage: "User with this information doesn't exist." });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            if (user.isAdmin) {
                return res.redirect('/admin');
            } else {
                return res.redirect('/logged');
            }
        });
    })(req, res, next);
});

app.get("/profile", isLogged, (req, res) => {
    res.render("profile", { user: req.user });
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { username, password }, 
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
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
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
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            console.log("User already is in database");
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ username: username , password: password});

        User.register(newUser, password, (err, user) => {
            if (err) {
                console.error('Error registering new user:', err);
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
            }
            res.status(201).json({ message: "User registered successfully", user: user });
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

app.get("/admin", (req, res) => {
    res.render("admin")
});

function isLogged(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

app.get('/weather/:city', isLogged, async (req, res) => {
    const city = req.params.city;

    try {
        let weatherData = await Weather.findOne({ city: city }).sort({ updatedAt: -1 });
        const currentTime = new Date();

        if (!weatherData || (currentTime - weatherData.updatedAt > 15 * 60 * 1000)) {
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
            const apiResponse = await axios.get(apiUrl);
            const apiData = apiResponse.data;

            if (weatherData) {
                weatherData.temperature = apiData.main.temp;
                weatherData.feelsLike = apiData.main.feels_like;
                weatherData.humidity = apiData.main.humidity;
                weatherData.windSpeed = apiData.wind.speed;
                weatherData.rainVolume = apiData.rain ? apiData.rain['1h'] : 0;
                weatherData.description = apiData.weather[0].description;
                weatherData.icon = apiData.weather[0].icon;

                await weatherData.save();
            } 
            else {
                weatherData = new Weather({
                    city: city,
                    temperature: apiData.main.temp,
                    feelsLike: apiData.main.feels_like,
                    humidity: apiData.main.humidity,
                    windSpeed: apiData.wind.speed,
                    rainVolume: apiData.rain ? apiData.rain['1h'] : 0,
                    description: apiData.weather[0].description,
                    country: apiData.sys.country,
                    coordinates: {
                        lat: apiData.coord.lat,
                        lon: apiData.coord.lon
                    },
                    icon: apiData.weather[0].icon
                });
                
                await weatherData.save();
            }
        }

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get("/country", isLogged, (req, res) => {
    res.render("country");
});

app.get('/search-history', isLogged, (req, res) => {
    const searchHistory = req.session.searchHistory || [];
    res.render('search-history', { searchHistory: searchHistory });
});

app.get('/country/:countryName', saveSearchToHistory, async (req, res) => {
    const countryName = req.params.countryName.toLowerCase();
    console.log(countryName)

    try {
        let country = await Country.findOne({ name: countryName });

        if (countryName === "USA") {
            res.json(country);
        }
        else if (!country) {
            const apiUrl = `https://restcountries.com/v3.1/name/${countryName}`;
            const response = await axios.get(apiUrl);
            const countryData = response.data[0];

            country = new Country({
                name: countryData.name.common.toLowerCase(),
                alpha2Code: countryData.cca2,
                capital: countryData.capital ? countryData.capital[0] : 'N/A',
                region: countryData.region,
                subregion: countryData.subregion,
                population: countryData.population,
                languages: countryData.languages ? Object.values(countryData.languages) : [],
                flag: countryData.flags.png || 'N/A',
            });

            await country.save();
        }

        res.json(country);
    } catch (error) {
        console.error('Error fetching country data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function saveSearchToHistory(req, res, next) {
    const countryName = req.params.countryName.toLowerCase();
    if (!req.session.searchHistory) {
        req.session.searchHistory = [];
    }
    if (!req.session.searchHistory.includes(countryName)) {
        req.session.searchHistory.push(countryName);
    }
    next();
}

app.get('/news', isLogged, async (req, res) => {
    let news = await News.find({}).sort({ publishedAt: -1 }).limit(10);
  
    if (news.length === 0) {
        newsApiKey = '5b97bfe72841415ba3f055c13e7484a3'
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}`);
        const newsData = response.data.articles;
    
        for (let item of newsData) {
            const newsItem = new News({
            title: item.title,
            description: item.description,
            url: item.url,
            urlToImage: item.urlToImage,
            publishedAt: new Date(item.publishedAt),
            content: item.content,
            author: item.author,
            sourceName: item.source.name 
            });
            await newsItem.save();
      }
  
      news = await News.find({}).sort({ publishedAt: -1 }).limit(10);
    }
  
    res.render('news', { news });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
