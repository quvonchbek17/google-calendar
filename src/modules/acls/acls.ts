import { Request, Response, NextFunction } from "express";
import { calendarBuilder } from "@config";
import { ErrorHandler } from "@errors";
import { v4 } from "uuid";

export class CalendarAclController {
  static async GelAllAclRules(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { calendarId } = req.query;

      const result = await calendar.acl.list({
        calendarId: String(calendarId),
      });

      res.status(200).send({
        success: true,
        message: "ACL qoidalari ro'yxati olindi",
        data: result.data.items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateAclRule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { calendarId, role, scopeType, scopeValue } = req.body;

      const result = await calendar.acl.insert({
        calendarId,
        requestBody: {
          role,
          scope: {
            type: scopeType,
            value: scopeValue,
          },
        },
      });

      res.status(200).send({
        success: true,
        message: "ACL qoidasi muvaffaqiyatli qo'shildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateAclRule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { calendarId, ruleId, role, scopeType, scopeValue } = req.body;

      const result = await calendar.acl.patch({
        calendarId,
        ruleId,
        requestBody: {
          role,
          scope: {
            type: scopeType,
            value: scopeValue,
          },
        },
      });

      res.status(200).send({
        success: true,
        message: 'ACL qoidasi muvaffaqiyatli yangilandi',
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async DeleteAclRule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { calendarId, ruleId } = req.body;

      await calendar.acl.delete({
        calendarId,
        ruleId,
      });

      calendar.freebusy
      res.status(200).send({
        success: true,
        message: 'ACL qoidasi muvaffaqiyatli o\'chirildi',
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async WatchAclChanges(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { calendarId, id, type, address } = req.body;

      const channelId = id || v4();
      const result = await calendar.acl.watch({
        calendarId,
        requestBody: {
          id: channelId,   // Yangi kanal uchun o'zingiz yaratgan unikal ID
          type: type,      // Kanal turi. Odatda "web_hook" bo'ladi
          address: address // Webhook xabarlar yuboriladigan URL
        },
      });

      res.status(200).send({
        success: true,
        message: 'ACL o\'zgarishlarini kuzatish muvaffaqiyatli yoqildi',
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
