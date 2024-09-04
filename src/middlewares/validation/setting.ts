import Joi from 'joi';

export const getSettingDto = Joi.object({
  settingId: Joi.string().required()
});

export const watchSettingsDto = Joi.object({
    id: Joi.string().optional(),
    type: Joi.string().valid('web_hook').required(),
    address: Joi.string().uri().required()
  });