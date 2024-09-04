import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

const calendarBuilder = async (access_token: string, refresh_token?: string) => {
    oAuth2Client.setCredentials({
        access_token: access_token,
        refresh_token: refresh_token,
    });

    let calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    return calendar
};

export { calendarBuilder };
