import jwt from "jsonwebtoken";
// import helper from "../utils/helper";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.send({
      status: false,
      status_code: 401,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    // Attach user info to request
    if (decoded?.role != "admin") {
      return res.send({
        status: false,
        status_code: 401,
        message: "You Are Not Allowed To Access This Route!!",
      });
    }
    req.admin = decoded;

    // Continue to the next middleware or route
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.send({
      status: false,
      status_code: 401,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export default authMiddleware;
