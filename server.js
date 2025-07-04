import express from "express";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./router/user.route.js";
import adminRoutes from "./router/admin.route.js";
import blogRoutes from "./router/blog.route.js";

const app = express();
dotenv.config();

app.use(cors());

app.use(express.json());

// Express Fileupload Used For Upload Blog Related Media
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes

//Test Route For Server Health Check
app.get("/", (req, res) =>
  res.send({
    status: true,
    message: "Welcome to My Blog Server",
  })
);

// User Related Routes (Ex- User Login , Signup etc.)
app.use("/api/user", userRoutes);

// Admin Related Routes (Ex- Admin Login,Blog CRUD.)
app.use("/api/admin", adminRoutes);

// Blog Related Routes (Ex-Get All Blogs ,Like Blog etc.)
app.use("/api/blog", blogRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`App Running on port http://localhost:${PORT}`)
);
