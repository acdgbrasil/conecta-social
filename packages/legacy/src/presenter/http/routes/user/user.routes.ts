import { Router } from 'express';
import { UserController } from '../../../../useCase/controllers/userController.ts';

import { registerFamilyCommunityRoutes } from './familyCommunity.routes.ts';
import { registerFamilyCompositionRoutes } from './familyComposition.routes.ts';
import { registerFamilyHistoryRoutes } from './familyHistory.routes.ts';
import { registerFirstEntryRoutes } from './firstEntry.routes.ts';
import { registerHealthConditionRoutes } from './healthCondition.routes.ts';
import { registerHomeConditionRoutes } from './homeCondition.routes.ts';
import { registerReferencePersonRoutes } from './referencePerson.routes.ts';
import { registerSocioEducationalRoutes } from './socioEducational.routes.ts';
import { registerUserManagementRoutes } from './userManagement.routes.ts';
import { registerViolenceSituationRoutes } from './violenceSituation.routes.ts';
import { registerWorkConditionRoutes } from './workCondition.routes.ts';

const userRouter = Router();
const userController = new UserController();

const registrators = [
  registerFamilyHistoryRoutes,
  registerSocioEducationalRoutes,
  registerFamilyCommunityRoutes,
  registerFamilyCompositionRoutes,
  registerHealthConditionRoutes,
  registerViolenceSituationRoutes,
  registerWorkConditionRoutes,
  registerHomeConditionRoutes,
  registerFirstEntryRoutes,
  registerReferencePersonRoutes,
  registerUserManagementRoutes,
];

registrators.forEach((register) => register(userRouter, userController));

export default userRouter;
