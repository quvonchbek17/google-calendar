import Joi from "joi";

export const createCalendarDto = Joi.object().keys({
  summary: Joi.string().required(),
  description: Joi.string().required(),
  timeZone: Joi.string().required(),
  location: Joi.string().optional(),
});

export const exportCalendarFileDto = Joi.object().keys({
  calendarId: Joi.string().required(),
});

export const addCalendarFromUrlDto = Joi.object().keys({
  calendarUrl: Joi.string().required(),
});

export const getCalendarByIdDto = Joi.object().keys({
  calendarId: Joi.string().required(),
});

export const updateCalendarDto = Joi.object().keys({
  calendarId: Joi.string().required(),
  summary: Joi.string().optional(),
  description: Joi.string().optional(),
  timeZone: Joi.string().optional(),
  location: Joi.string().optional(),
});

export const updateCalendarPropertiesDto = Joi.object({
  calendarId: Joi.string().required(),
  summary: Joi.string().optional(),
  description: Joi.string().optional(),
  timeZone: Joi.string().optional(),
  location: Joi.string().optional(),
  colorId: Joi.string()
    .optional()
    .valid("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"),
  selected: Joi.boolean().optional(),
  hidden: Joi.boolean().optional(),
  summaryOverride: Joi.string().optional(),
  defaultReminders: Joi.array()
    .items(
      Joi.object({
        method: Joi.string().valid("email", "popup", "sms").required(),
        minutes: Joi.number().integer().min(0).required(),
      })
    )
    .optional(),
  notificationSettings: Joi.object({
    notifications: Joi.array()
      .items(
        Joi.object({
          type: Joi.string()
            .valid(
              "eventCreation",
              "eventChange",
              "eventCancellation",
              "eventResponse",
              "agenda"
            )
            .required(),
          method: Joi.string().valid("email", "popup", "sms").required(),
        })
      )
      .optional(),
  }).optional(),
  primary: Joi.boolean().optional(),
  accessRole: Joi.string()
    .valid("owner", "writer", "reader", "freeBusyReader")
    .optional(),
});

export const deleteCalendarDto = Joi.object().keys({
  calendarId: Joi.string().required(),
});

export const importEventsFromFileDto = Joi.object().keys({
  calendarId: Joi.string().optional(),
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string()
      .valid("text/calendar", "application/vnd.ms-outlook")
      .required(),
    buffer: Joi.binary().required(),
  }).optional(),
});

export const freeBusyCheckDto = Joi.object({
  timeMin: Joi.string().isoDate().required(),
  timeMax: Joi.string().isoDate().required(),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().email().required(),
      })
    )
    .min(1)
    .required(),
});
