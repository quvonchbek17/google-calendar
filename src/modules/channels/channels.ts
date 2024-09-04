import { Request, Response, NextFunction } from 'express';
import { calendarBuilder } from '@config';
import { ErrorHandler } from '@errors';

export class CalendarChannelsController {
  static async StopChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const calendar = await calendarBuilder(token);

      const { id, resourceId } = req.body;

      await calendar.channels.stop({
        requestBody: {
          id,           // Kanal ID'si
          resourceId,   // Kanal resurs ID'si
        },
      });

      res.status(200).send({
        success: true,
        message: 'Kanal muvaffaqiyatli to\'xtatildi',
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
