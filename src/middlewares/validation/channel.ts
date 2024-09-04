import Joi from "joi";
export const stopChannelDto = Joi.object({
  id: Joi.string().required().description("Kanal uchun unikal ID."),
  resourceId: Joi.string()
    .required()
    .description("Google tomonidan berilgan resurs ID."),
});
