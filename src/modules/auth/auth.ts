import { Request, Response, NextFunction } from "express";
import passport from "passport";
import * as fs from "fs";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import { ErrorHandler } from "@errors";
dotenv.config();

export class AuthController {
  // Redirect to Google login
  static googleLogin(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("google", {
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/calendar"
      ],
      accessType: "offline",
      prompt: "consent",
    })(req, res, next);
  }

  // Google login callback
  static googleCallback(req: Request, res: Response, next: NextFunction): void {
    try {
      passport.authenticate("google", {
        failureRedirect: "/auth/login",
      })(req, res, () => {
        const tokens = (req.user as any).tokens;
        let tokensJson = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), "tokens.json"), "utf-8")
        );

        tokensJson.push(tokens);
        fs.writeFileSync(
          path.join(process.cwd(), "tokens.json"),
          JSON.stringify(tokensJson, null, 2)
        );
        res.send(tokens);
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async getAccessTokenWithRefresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { refresh_token } = req.body;
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: "refresh_token",
      });

      let tokensJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "tokens.json"), "utf-8")
      );

      tokensJson.push(response.data);
      fs.writeFileSync(
        path.join(process.cwd(), "tokens.json"),
        JSON.stringify(tokensJson, null, 2)
      );

      res.status(200).send({
        success: true,
        message: "Yangi tokenlar",
        data: response.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Logout
  static logout(req: Request, res: Response, next: NextFunction): void {
    try {
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        req.session.destroy((err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Failed to destroy session" });
          }
          res.redirect("/login");
        });
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
