import { Request, Response, NextFunction } from "express";
import { getSupabase } from "../lib/supabase/supabase.js";

const supabase = getSupabase();
// Define custom interface extending Express Request
interface CustomRequest extends Request {
  token?: string;
  user?: any;
}

export const authenticateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authorization token" });
  }

  const token = authHeader.split(" ")[1];

  req.token = token;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;

  next();
};
