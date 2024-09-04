import Joi from "joi";

export const createEventDto = Joi.object({
  calendarId: Joi.string().required(),
  event: Joi.object({
    summary: Joi.string().optional(),
    location: Joi.string().optional(),
    description: Joi.string().optional(),
    start: Joi.object({
      dateTime: Joi.date().iso().required(),
      timeZone: Joi.string().optional(),
    }).required(),
    end: Joi.object({
      dateTime: Joi.date().iso().required(),
      timeZone: Joi.string().optional(),
    }).required(),
    recurrence: Joi.array().items(Joi.string()).optional(),
    attendees: Joi.array()
      .items(
        Joi.object({
          email: Joi.string().email().required(),
        })
      )
      .optional(),
    reminders: Joi.object({
      useDefault: Joi.boolean().optional(),
      overrides: Joi.array()
        .items(
          Joi.object({
            method: Joi.string().valid("email", "popup", "sms").optional(),
            minutes: Joi.number().optional(),
          })
        )
        .optional(),
    }).optional(),
  }).required(),
});

export const getAllEventsDto = Joi.object({
  calendarId: Joi.string().required(),
  timeMin: Joi.date().iso().optional(),
  timeMax: Joi.date().iso().optional(),
  singleEvents: Joi.boolean().optional(),
  orderBy: Joi.string().valid("startTime", "updated").optional(),
});

export const updateEventDto = Joi.object({
  calendarId: Joi.string().required(),
  eventId: Joi.string().required(),
  event: Joi.object({
    summary: Joi.string().optional(),
    location: Joi.string().optional(),
    description: Joi.string().optional(),
    start: Joi.object({
      dateTime: Joi.date().iso().optional(),
      timeZone: Joi.string().optional(),
    }).optional(),
    end: Joi.object({
      dateTime: Joi.date().iso().optional(),
      timeZone: Joi.string().optional(),
    }).optional(),
    attendees: Joi.array()
      .items(
        Joi.object({
          email: Joi.string().email().required(), // Ishtirokchi email manzili (ixtiyoriy)
        })
      )
      .optional(),
  }).optional(),
});

export const deleteEventDto = Joi.object({
  calendarId: Joi.string().required(),
  eventId: Joi.string().required(),
});

export const getEventByIdDto = Joi.object({
  calendarId: Joi.string().required(),
  eventId: Joi.string().required(),
});

export const copyEventDto = Joi.object({
  calendarId: Joi.string().required(),
  eventId: Joi.string().required(),
  destinationCalendarId: Joi.string().required(),
});

export const moveEventDto = Joi.object({
  calendarId: Joi.string().required(),
  eventId: Joi.string().required(),
  destinationCalendarId: Joi.string().required(),
});

export const watchEventsDto = Joi.object({
  calendarId: Joi.string().required(),
  requestBody: Joi.object({
    id: Joi.string().required(),
    type: Joi.string().valid("web_hook").required(),
    address: Joi.string().uri().required(), 
  }).required(),
});
