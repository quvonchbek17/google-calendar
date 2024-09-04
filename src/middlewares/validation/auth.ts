import Joi from "joi";

export const getAccessTokenWithRefreshDto = Joi.object().keys({
    refresh_token: Joi.string().required()
});
