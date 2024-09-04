import { Router } from "express";
import {CalendarSettingsController} from "./settings";
import {   validate, getSettingDto, watchSettingsDto } from "@middlewares";

const SettingsRouter = Router()

SettingsRouter
    .get('/all', CalendarSettingsController.GetAllSettings)
    .get('/get-by-id', validate(getSettingDto, "query"), CalendarSettingsController.GetSettingById)
    .post('/watch', validate(watchSettingsDto), CalendarSettingsController.WatchSettings)

export {SettingsRouter}