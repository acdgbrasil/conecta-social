import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import {
  FamilyHistoryInstitutionalComplet,
  otherFamilySeparationSituationsStruct,
} from '../../../../domain/entity/familyHistoryInstitutionalComplet.ts';
import { FamilyInstitucionalHistory } from '../../../../domain/entity/familyInstitucionalHistory.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerFamilyHistoryRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/family/history/institutional/observation', async (req, res) => {
    try {
      const { familyHistoryInstitutionalCompletId, observation, whoIsObservingId } = req.body;
      if (!familyHistoryInstitutionalCompletId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family History Institutional Complet Id is required',
        );
        return res
          .status(400)
          .json(error.toJson('Family History Institutional Complet Id is required'));
      }
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }
      const observationSchema = new Observations(observation, whoIsObservingId);
      const observationCreated = await userController.createFamilyHistoryInstitutionalCompletObservation(
        familyHistoryInstitutionalCompletId,
        observationSchema,
      );
      return res.status(201).json(observationCreated);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/family/history/institutional', async (req, res) => {
    try {
      const {
        familyInstitutionalShelterHistory,
        childCustodyHistory,
        hasMemberInPrision,
        hasMemberInadolescentInSocioEducationalInternment,
        familyHistoryInstitutionalCompletId,
        dateInitJson,
        dateFinishJson,
        reason,
        familyCompositionId,
        personId,
      } = req.body;

      if (!familyInstitutionalShelterHistory) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family Institutional Shelter History is required',
        );
        return res
          .status(400)
          .json(error.toJson('Family Institutional Shelter History is required'));
      }

      if (!childCustodyHistory) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Child Custody History is required',
        );
        return res.status(400).json(error.toJson('Child Custody History is required'));
      }

      if (!(typeof hasMemberInPrision == 'boolean') || hasMemberInPrision == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Member In Prision is required',
        );
        return res.status(400).json(error.toJson('Has Member In Prision is required'));
      }

      if (
        !(typeof hasMemberInadolescentInSocioEducationalInternment == 'boolean') ||
        hasMemberInadolescentInSocioEducationalInternment == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Member In Adolescent In Socio Educational Internment is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Member In Adolescent In Socio Educational Internment is required'));
      }

      if (!dateInitJson) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date Init is required');
        return res.status(400).json(error.toJson('Date Init is required'));
      }

      if (!dateFinishJson) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date Finish is required');
        return res.status(400).json(error.toJson('Date Finish is required'));
      }

      if (!reason) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Reason is required');
        return res.status(400).json(error.toJson('Reason is required'));
      }

      if (!familyCompositionId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family Composition Id is required',
        );
        return res.status(400).json(error.toJson('Family Composition Id is required'));
      }

      if (!personId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Person Id is required');
        return res.status(400).json(error.toJson('Person Id is required'));
      }

      const dateInit = new Date(dateInitJson);
      const dateFinish = new Date(dateFinishJson);

      const otherFamilySeparationSituations = new otherFamilySeparationSituationsStruct(
        hasMemberInPrision,
        hasMemberInadolescentInSocioEducationalInternment,
      );
      const familyHistoryInstitutionalComplet = new FamilyHistoryInstitutionalComplet(
        familyInstitutionalShelterHistory,
        childCustodyHistory,
        otherFamilySeparationSituations,
        true,
      );
      const familyInstitucionalHistoryPerson = new FamilyInstitucionalHistory(
        dateInit,
        dateFinish,
        reason,
        true,
      );

      const result = await userController.createFamilyHistoryInstitutionalComplets(
        familyHistoryInstitutionalComplet,
        familyHistoryInstitutionalCompletId,
        familyInstitucionalHistoryPerson,
        familyCompositionId,
        personId,
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
