import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoConnect from "./db/mongoConnect.js";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// import routes
import userRoutes from './routes/users.routes.js'
// using routes

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

mongoConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
