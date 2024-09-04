import { AuthRouter, CalendarsRouter, EventsRouter, SettingsRouter, AclsRouter, ChannelsRouter } from "@modules"

const { Router } = require("express")

const router = Router()

router.use("/auth", AuthRouter)
router.use("/calendars", CalendarsRouter)
router.use("/events", EventsRouter)
router.use("/acls", AclsRouter)
router.use("/settings", SettingsRouter)
router.use("/channels", ChannelsRouter)

export default router