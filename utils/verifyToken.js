import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const verifyToken = async (req, res, next) => {

  let token;

  if (
      req.cookies.quickToken
  ) {
      try {
          token = req.cookies?.quickToken
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = await User.findById(decoded.id).select('-pin');
          next();
      } catch (error) {
          res.status(401).json({ message: 'Not authorized, token failed' });
      }
  }

  if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default verifyToken;