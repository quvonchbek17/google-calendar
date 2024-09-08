import { Router } from "express";
import {EventController} from "./events";
import {  createEventDto, deleteEventDto, getAllEventsDto, getEventByIdDto, copyEventDto, updateEventDto, validate, moveEventDto, watchEventsDto } from "@middlewares";
import { upload } from "@config";

const EventsRouter = Router()

EventsRouter
    .get('/all', validate(getAllEventsDto, "query"), EventController.GetAllEvents)
    .get('/get-by-id', validate(getEventByIdDto, "query"), EventController.GetEventById)
    .post('/create', upload.array("files"), EventController.CreateEvent)
    .post('/copy-event', validate(copyEventDto), EventController.CopyEvent)
    .post('/move-event', validate(moveEventDto), EventController.MoveEvent)
    .post('/watch-event', validate(watchEventsDto), EventController.WatchEvents)
    .patch('/update', validate(updateEventDto), EventController.UpdateEvent)
    .delete('/delete', validate(deleteEventDto), EventController.DeleteEvent)

export {EventsRouter}