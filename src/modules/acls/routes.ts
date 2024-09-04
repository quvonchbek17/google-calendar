import { Router } from "express";
import { CalendarAclController } from "./acls";
import { createAclRuleDto, deleteAclRuleDto, getAllAclRulesDto, updateAclRuleDto, validate, watchAclChangesDto } from "@middlewares";

const AclsRouter = Router()

AclsRouter
    .get('/all', validate(getAllAclRulesDto, "query"), CalendarAclController.GelAllAclRules)
    .post('/create', validate(createAclRuleDto), CalendarAclController.CreateAclRule)
    .post('/watch', validate(watchAclChangesDto), CalendarAclController.WatchAclChanges)
    .patch('/update', validate(updateAclRuleDto), CalendarAclController.UpdateAclRule)
    .delete('/delete', validate(deleteAclRuleDto), CalendarAclController.DeleteAclRule)

export {AclsRouter}