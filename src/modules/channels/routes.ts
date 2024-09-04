import { Router } from "express";
import {CalendarChannelsController} from "./channels";
import { stopChannelDto, validate } from "@middlewares";

const ChannelsRouter = Router()

ChannelsRouter

    .post('/stop', validate(stopChannelDto), CalendarChannelsController.StopChannel)

export {ChannelsRouter}