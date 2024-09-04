import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { calendarBuilder } from "@config";

export class EventController {
  static async GetAllEvents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, timeMin, timeMax, singleEvents, orderBy } = req.query;

      const result = await calendar.events.list({
        calendarId: calendarId as string,
        timeMin: timeMin
          ? new Date(timeMin as string).toISOString()
          : undefined,
        timeMax: timeMax
          ? new Date(timeMax as string).toISOString()
          : undefined,
        singleEvents: singleEvents === "true",
        orderBy: orderBy as string,
      });

      res.status(200).send({
        success: true,
        message: "Tadbirlar ro'yxati olindi",
        data: result.data.items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetEventById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, eventId } = req.query;

      const result = await calendar.events.get({
        calendarId: String(calendarId),
        eventId: String(eventId),
      });

      res.status(200).send({
        success: true,
        message: "Tadbir ma'lumotlari olindi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, event } = req.body;

      const result = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      res.status(200).send({
        success: true,
        message: "Tadbir muvaffaqiyatli yaratildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, eventId, event } = req.body;

      // Boshlanish va tugash vaqtlarini tekshirish
      if (new Date(event.start?.dateTime) >= new Date(event.end?.dateTime)) {
        return next(
          new ErrorHandler(
            "The specified time range is invalid. Start time must be before end time.",
            400
          )
        );
      }

      const result = await calendar.events.patch({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: event,
      });

      res.status(200).send({
        success: true,
        message: "Tadbir muvaffaqiyatli yangilandi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, eventId } = req.body;

      await calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });

      res.status(200).send({
        success: true,
        message: "Tadbir muvaffaqiyatli o'chirildi",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CopyEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, eventId, destinationCalendarId } = req.body;

      // Asl tadbirni olish
      const originalEvent = await calendar.events.get({
        calendarId: calendarId,
        eventId: eventId,
      });

      // Faqat kerakli maydonlarni olish
      const event = {
        summary: originalEvent.data.summary,
        description: originalEvent.data.description,
        location: originalEvent.data.location,
        start: originalEvent.data.start,
        end: originalEvent.data.end,
        attendees: originalEvent.data.attendees,
        reminders: originalEvent.data.reminders,
      };

      const result = await calendar.events.insert({
        calendarId: destinationCalendarId,
        requestBody: event,
      });

      res.status(200).send({
        success: true,
        message: "Tadbir muvaffaqiyatli nusxalandi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async MoveEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, eventId, destinationCalendarId } = req.body;

      // Tadbirni boshqa kalendarga ko'chirish
      const result = await calendar.events.move({
        calendarId: calendarId,
        eventId: eventId,
        destination: destinationCalendarId,
      });

      res.status(200).send({
        success: true,
        message: "Tadbir muvaffaqiyatli ko'chirildi",
        data: result.data,
      });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return next(new ErrorHandler('Calendar or event not found. Please check the IDs and try again.', 404));
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async WatchEvents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      let calendar = await calendarBuilder(token);

      const { calendarId, requestBody } = req.body;

      calendar.acl

      const result = await calendar.events.watch({
        calendarId: calendarId,
        requestBody: requestBody,
      });

      res.status(200).send({
        success: true,
        message: 'Tadbirlar uchun kuzatish muvaffaqiyatli yoqildi',
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
