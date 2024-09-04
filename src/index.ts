import express, { Application } from "express";
import { errorHandler } from "@middlewares";
import passport from "passport"
import cors from "cors";
import path from "path"
import router from "./routes";
import dotenv from "dotenv";
import session from "express-session";
import "./config/passport";
dotenv.config();
const app: Application = express();

//// cors
app.use(cors({ origin: "*" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.initialize());
app.use(passport.session());


app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"))
app.use(express.static(path.join(process.cwd(), "src", "public")))

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get('/', (req, res) => res.render("index.ejs"));
app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(port);
});
