import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { calendarBuilder, driveBuilder } from "@config";
import * as fs from "fs";
import path from "path";

export class EventController {
  static async GetDriveMetaData(
    driveFileId: string,
    token: string,
    next: NextFunction
  ) {
    try {
      const drive = await driveBuilder(token);

      const response = await drive.files.get({
        fileId: driveFileId,
        fields: "id, name, mimeType, webViewLink, iconLink",
      });

      return response.data;
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UploadFileToDrive(file: any, token: string, next: NextFunction) {
    try {
      const drive = await driveBuilder(token);

      const fileMetadata = {
        name: file.filename,
      };

      let filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(filePath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
      });

      fs.unlinkSync(filePath);
      let result = await EventController.GetDriveMetaData(
        response.data?.id as string,
        token,
        next
      );
      return result;
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

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

      let { calendarId, event, addGoogleMeet, driveFileIds } = req.body;
      let files = req.files as Express.Multer.File[] | undefined;

      if (typeof event === "string") {
        event = JSON.parse(event);
      }

      const requestBody: any = {
        ...event,
      };

      let attachments = [];

      if (files) {
        for (let file of files) {
          let fileMetadata = await EventController.UploadFileToDrive(
            file,
            token,
            next
          );
          if (fileMetadata) {
            attachments.push({
              fileId: fileMetadata.id,
              fileUrl: fileMetadata.webViewLink,
              title: fileMetadata.name,
              mimeType: fileMetadata.mimeType,
              iconLink: fileMetadata.iconLink,
            });
          }
        }
        requestBody.attachments = attachments;
      }
      if (driveFileIds?.length > 0) {
        for (let driveFileId of driveFileIds) {
          let fileMetadata = await EventController.GetDriveMetaData(
            driveFileId,
            token,
            next
          );

          if (fileMetadata) {
            attachments.push({
              fileId: driveFileId,
              fileUrl: fileMetadata.webViewLink,
              title: fileMetadata.name,
              mimeType: fileMetadata.mimeType,
              iconLink: fileMetadata.iconLink,
            });
          }
        }

        requestBody.attachments = attachments;
      }

      if (addGoogleMeet) {
        requestBody.conferenceData = {
          createRequest: {
            requestId: Math.random().toString(36).substring(2),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
      }

      const result = await calendar.events.insert({
        calendarId: calendarId,
        requestBody,
        supportsAttachments: attachments.length > 0 ? true : false,
        conferenceDataVersion: addGoogleMeet ? 1 : undefined,
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

      const { calendarId, eventId, event, fileIdToRemove } = req.body;

      // Boshlanish va tugash vaqtlarini tekshirish
      if (new Date(event.start?.dateTime) >= new Date(event.end?.dateTime)) {
        return next(
          new ErrorHandler(
            "The specified time range is invalid. Start time must be before end time.",
            400
          )
        );
      }

      const eventById = await calendar.events.get({
        calendarId: calendarId,
        eventId: eventId,
      });

      let updatedEvent = {
        ...event
      }

      if(eventById.data.attachments){
        const updatedAttachments = eventById.data.attachments.filter(
          (attachment: any) => attachment.fileId !== fileIdToRemove
        );

        updatedEvent = {
          ...updatedEvent,
          attachments: updatedAttachments
        }
      }

      const result = await calendar.events.patch({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: updatedEvent,
        supportsAttachments: fileIdToRemove ? true: false
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
        return next(
          new ErrorHandler(
            "Calendar or event not found. Please check the IDs and try again.",
            404
          )
        );
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

      calendar.acl;

      const result = await calendar.events.watch({
        calendarId: calendarId,
        requestBody: requestBody,
      });

      res.status(200).send({
        success: true,
        message: "Tadbirlar uchun kuzatish muvaffaqiyatli yoqildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
