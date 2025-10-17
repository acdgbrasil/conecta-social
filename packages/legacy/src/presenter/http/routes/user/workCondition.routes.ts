import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { WorkCondition } from '../../../../domain/entity/workCondition.ts';
import { WorkConditionPerson } from '../../../../domain/entity/familyComposition.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerWorkConditionRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/work/condition/observation', async (req, res) => {
    try {
      const { observation, workConditionId } = req.body;
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!workConditionId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Work Condition Id is required');
        return res.status(400).json(error.toJson('Work Condition Id is required'));
      }
      const created = await userController.createWorkConditionObservation(workConditionId, observation);
      return res.status(201).json(created);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/work/condition', async (req, res) => {
    try {
      const {
        hasSocialIncome,
        perCapitaIncome,
        bolsaFamiliaValue,
        bpcValue,
        petiValue,
        othersValue,
        bcpBenefitPerson,
        hasRetiredPerson,
        totalFamilyIncome,
        totalPerCapitaIncome,
        workConditionBody,
        hasWorkCard,
        workQualification,
        workValue,
        familyCompositionID,
        personId,
        workConditionId,
      } = req.body;

      const workCondition = new WorkCondition(
        hasSocialIncome,
        perCapitaIncome,
        hasSocialIncome,
        bolsaFamiliaValue,
        bpcValue,
        petiValue,
        othersValue,
        bcpBenefitPerson,
        hasRetiredPerson,
        totalFamilyIncome,
        totalPerCapitaIncome,
      );
      const workConditionPerson = new WorkConditionPerson(
        true,
        workConditionBody,
        hasWorkCard,
        workQualification,
        workValue,
      );
      const result = await userController.createWorkConditionPerson(
        workCondition,
        workConditionPerson,
        familyCompositionID,
        personId,
        workConditionId,
      );
      return res.status(201).json(result);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
