import { Router } from "express";
import {CalendarsController} from "./calendars";
import { addCalendarFromUrlDto, createCalendarDto, deleteCalendarDto, exportCalendarFileDto, freeBusyCheckDto, getCalendarByIdDto, importEventsFromFileDto, updateCalendarDto, updateCalendarPropertiesDto, validate } from "@middlewares";
import { upload } from "@config";

const CalendarsRouter = Router()

CalendarsRouter
    .get('/all', CalendarsController.GetAllCalendars)
    .get('/my-calendars', CalendarsController.GetMyCalendars)
    .get('/other-calendars', CalendarsController.GetOtherCalendars)
    .get('/get-by-id', validate(getCalendarByIdDto, "query"), CalendarsController.GetCalendarById)
    .post('/create', validate(createCalendarDto), CalendarsController.CreateCalendar)
    .post('/check-free-busy', validate(freeBusyCheckDto), CalendarsController.CheckFreeBusy)
    .post('/import-events-from-file', validate(importEventsFromFileDto), upload.single("file"), CalendarsController.ImportEventsFromFile)
    .post('/add-from-url', validate(addCalendarFromUrlDto), CalendarsController.AddCalendarFromURL)
    .post('/export-calendar-file', validate(exportCalendarFileDto), CalendarsController.ExportCalendarFile)
    .patch('/update', validate(updateCalendarDto), CalendarsController.UpdateCalendar)
    .patch('/update-properties', validate(updateCalendarPropertiesDto), CalendarsController.UpdateCalendarProperties)
    .delete('/delete', validate(deleteCalendarDto, "query"), CalendarsController.DeleteCalendar)

export {CalendarsRouter}