import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoConnect from "./db/mongoConnect.js";






dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// import routes
import userRoutes from "./routes/users.routes.js";

// using routes

app.use("/users", userRoutes);




mongoConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
