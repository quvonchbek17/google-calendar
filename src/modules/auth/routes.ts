import { Router } from "express";
import {AuthController} from "./auth";
import { getAccessTokenWithRefreshDto, validate } from "@middlewares";

const AuthRouter = Router()

AuthRouter.get('/login', AuthController.googleLogin);
AuthRouter.get('/callback', AuthController.googleCallback);
AuthRouter.get('/logout', AuthController.logout);

AuthRouter.post('/refresh-token', validate(getAccessTokenWithRefreshDto), AuthController.getAccessTokenWithRefresh);

export {AuthRouter}