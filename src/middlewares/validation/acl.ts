import Joi from "joi";

export const createAclRuleDto = Joi.object({
  calendarId: Joi.string().required(),
  role: Joi.string()
    .valid("none", "freeBusyReader", "reader", "writer", "owner")
    .required(),
  scopeType: Joi.string()
    .valid("default", "user", "group", "domain")
    .required(),
  scopeValue: Joi.string().when("scopeType", {
    is: "default",
    then: Joi.forbidden(),
    otherwise: Joi.string().required(),
  }),
});

export const getAllAclRulesDto = Joi.object({
  calendarId: Joi.string().required(),
});

export const updateAclRuleDto = Joi.object({
  calendarId: Joi.string().required(),
  ruleId: Joi.string().required(),
  role: Joi.string()
    .valid("none", "freeBusyReader", "reader", "writer", "owner")
    .optional(),
  scopeType: Joi.string()
    .valid("default", "user", "group", "domain")
    .optional(),
  scopeValue: Joi.string().when("scopeType", {
    is: "default",
    then: Joi.forbidden(),
    otherwise: Joi.string().optional(),
  }),
});

export const deleteAclRuleDto = Joi.object({
  calendarId: Joi.string().required(),
  ruleId: Joi.string().required(),
});

export const watchAclChangesDto = Joi.object({
    calendarId: Joi.string().required(),
    id: Joi.string().optional(),
    type: Joi.string().valid('web_hook').required(),
    address: Joi.string().uri().required()
  });
