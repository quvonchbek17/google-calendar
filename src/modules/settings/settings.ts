import { Request, Response, NextFunction } from "express";
import { calendarBuilder } from "@config";
import { ErrorHandler } from "@errors";
import { v4 } from "uuid";

export class CalendarSettingsController {
  static async GetAllSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const result = await calendar.settings.list();

      res.status(200).send({
        success: true,
        message: "Barcha sozlamalar muvaffaqiyatli olindi",
        data: result.data.items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetSettingById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { settingId } = req.query;

      const result = await calendar.settings.get({
        setting: String(settingId),
      });

      calendar.channels

      res.status(200).send({
        success: true,
        message: "Sozlama muvaffaqiyatli olindi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async WatchSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { id, type, address } = req.body;

      const channelId = id || v4();

      const result = await calendar.settings.watch({
        requestBody: {
          id: channelId,        // Kanal uchun unikal ID
          type: type,           // Kanal turi, odatda "web_hook"
          address: address      // Webhook xabarlar yuboriladigan URL
        },
      });

      res.status(200).send({
        success: true,
        message: 'Kalendar sozlamalari o\'zgarishlarini kuzatish muvaffaqiyatli yoqildi',
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
