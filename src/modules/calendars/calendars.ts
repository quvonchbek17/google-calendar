import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { calendarBuilder } from "@config";
import * as fs from "fs";
import path from "path";
import ical from "ical";
import icalgenerator from "ical-generator"

export class CalendarsController {
  static async ParseICS(icsData: string) {
    try {
      const parsedData = ical.parseICS(icsData);
      const events = [];

      for (let key in parsedData) {
        const event = parsedData[key];
        if (event.type === "VEVENT") {
          events.push({
            summary: event.summary,
            start: {
              dateTime: event.start ? event.start.toISOString() : undefined,
            },
            end: {
              dateTime: event.end ? event.end.toISOString() : undefined,
            },
            description: event.description,
          });
        }
      }

      return events;
    } catch (error: any) {
      console.error("Error parsing ICS data:", error);
      return []; // Xatolik yuz berganda bo'sh array qaytariladi
    }
  }

  static async GetAllCalendars(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const result = await calendar.calendarList.list();
      res.status(200).send({
        success: true,
        message: "Barcha kalendarlar muvaffaqiyatli olindi",
        data: result.data.items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetCalendarById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId } = req.query;

      const result = await calendar.calendarList.get({
        calendarId: String(calendarId) || "primary",
      });

      res.status(200).send({
        success: true,
        message: "Kalendar ma'lumotlari muvaffaqiyatli olindi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetMyCalendars(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const result = await calendar.calendarList.list();

      const myCalendars = result.data.items?.filter(
        (calendar) =>
          calendar.accessRole === "owner" || calendar.accessRole === "writer"
      );

      res.status(200).send({
        success: true,
        message: "My Calendars muvaffaqiyatli olindi",
        data: myCalendars,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetOtherCalendars(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const result = await calendar.calendarList.list();

      const otherCalendars = result.data.items?.filter(
        (calendar) =>
          calendar.accessRole === "reader" ||
          calendar.accessRole === "freeBusyReader"
      );

      res.status(200).send({
        success: true,
        message: "Other Calendars muvaffaqiyatli olindi",
        data: otherCalendars,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateCalendar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { summary, description, timeZone, location } = req.body;

      const result = await calendar.calendars.insert({
        requestBody: {
          summary,
          description,
          timeZone,
          location,
        },
      });

      res.status(200).send({
        success: true,
        message: "Yangi kalendar muvaffaqiyatli yaratildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async AddCalendarFromURL(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarUrl } = req.body;

      const result = await calendar.calendarList.insert({
        requestBody: {
          id: calendarUrl,
        },
      });

      res.status(200).send({
        success: true,
        message: "Kalendar URL orqali muvaffaqiyatli qo'shildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ImportEventsFromFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId } = req.body;
      const file = req.file as Express.Multer.File | undefined;

      let filePath = "";
      if (file) {
        filePath = path.join(process.cwd(), "uploads", file.fieldname);
      }
      const icsData = fs.readFileSync(filePath, "utf-8");

      const events = await CalendarsController.ParseICS(icsData);

      // Har bir tadbirni Google Calendar'ga qo'shish
      for (let event of events) {
        await calendar.events.insert({
          calendarId: calendarId || "primary",
          requestBody: event,
        });
      }

      res.status(200).send({
        success: true,
        message: "ICS fayldan tadbirlar muvaffaqiyatli import qilindi",
      });
      fs.unlinkSync(filePath);
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ExportCalendarFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId } = req.body;

      const calendarDetails = await calendar.calendars.get({ calendarId });

      // Kalendar tadbirlarini olish
      const events = await calendar.events.list({
        calendarId: calendarId,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      // ICS faylini yaratish uchun ical-generator kutubxonasidan foydalanish
      const cal = icalgenerator({ name: calendarDetails.data.summary || 'My Calendar' });

      events.data.items?.forEach(event => {
        cal.createEvent({
          start: new Date(event.start?.dateTime || event.start?.date || ''),
          end: new Date(event.end?.dateTime || event.end?.date || ''),
          summary: event.summary || "",
          description: event.description || "",
          location: event.location || "",
          url: event.htmlLink
        });
      });

      // Faylni serverda vaqtinchalik joyga saqlash
      const filePath = path.join(process.cwd(), `${calendarId}.ics`);
      fs.writeFileSync(filePath, cal.toString());

      // Faylni foydalanuvchiga jo'natish
      res.setHeader('Content-Disposition', `attachment; filename="${calendarDetails.data.summary || 'calendar'}.ics"`);
      res.setHeader('Content-Type', 'text/calendar');
      res.download(filePath, `${calendarDetails.data.summary || 'calendar'}.ics`, (err) => {
        if (err) {
          next(new ErrorHandler(err.message, 500));
        }

        // Faylni vaqtinchalik joydan o'chirish
        fs.unlinkSync(filePath);
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateCalendar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, summary, description, timeZone, location  } = req.body;

      const result = await calendar.calendars.patch({
        calendarId: calendarId || "primary",
        requestBody: {
          summary,
          description,
          timeZone,
          location,
        },
      });

      res.status(200).send({
        success: true,
        message: "Kalendar muvaffaqiyatli yangilandi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateCalendarProperties(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const {
        calendarId,
        colorId,
        selected,
        hidden,
        summaryOverride,
      } = req.body;

      const result = await calendar.calendarList.patch({
        calendarId: calendarId,
        requestBody: {
          colorId: colorId,
          selected: selected,
          hidden: hidden,
          summaryOverride: summaryOverride,
          defaultReminders: [
            {
                method: "email",
                minutes: 10
            }
          ]
        },
      });

      res.status(200).send({
        success: true,
        message: 'Kalendar ro\'yxati muvaffaqiyatli yangilandi',
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteCalendar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId } = req.body;

      await calendar.calendars.delete({
        calendarId: calendarId,
      });

      res.status(200).send({
        success: true,
        message: "Kalendar muvaffaqiyatli o'chirildi",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async CheckFreeBusy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { timeMin, timeMax, items } = req.body;

      const result = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items,
        },
      });

      res.status(200).send({
        success: true,
        message: 'Bo\'sh/Band vaqtlar muvaffaqiyatli tekshirildi',
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
