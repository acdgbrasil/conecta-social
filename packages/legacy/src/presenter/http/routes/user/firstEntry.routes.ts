import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import { FirstEntryInUnity } from '../../../../domain/entity/firstEntryInUnity.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerFirstEntryRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.get('/list/first/entry/in/unity/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity Id is required');
        return res.status(400).json(error.toJson('First Entry In Unity Id is required'));
      }
      const firstEntryInUnity = await userController.getFirstEntryInUnity(id);
      return res.status(200).json(firstEntryInUnity);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/first/entry/observation', async (req, res) => {
    try {
      const { observation, whoIsObservingId, firstEntryInUnityId } = req.body;
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }
      if (!firstEntryInUnityId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity Id is required');
        return res.status(400).json(error.toJson('First Entry In Unity Id is required'));
      }
      const newObservation = new Observations(observation, whoIsObservingId);
      const observationCreated = await userController.createFirstEntryInUnityObservation(
        firstEntryInUnityId,
        newObservation,
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

  router.post('/create/first/entry/in/unity', async (req, res) => {
    try {
      const {
        firstEntryInUnity,
        motivationForFirstEntry,
        nameOfUnityToSendFirstEntry,
        ContactEmailOfUnityToSendFirstEntry,
        familyBenefits,
        whoIsResponsibleForFirstEntryId,
        firstEntryInUnityID,
      } = req.body;

      if (!firstEntryInUnity) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity is required');
        return res.status(400).json(error.toJson('First Entry In Unity is required'));
      }
      if (!motivationForFirstEntry) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Motivation For First Entry is required',
        );
        return res.status(400).json(error.toJson('Motivation For First Entry is required'));
      }
      if (!nameOfUnityToSendFirstEntry) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Name Of Unity To Send First Entry is required',
        );
        return res.status(400).json(error.toJson('Name Of Unity To Send First Entry is required'));
      }
      if (!ContactEmailOfUnityToSendFirstEntry) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Contact Email Of Unity To Send First Entry is required',
        );
        return res
          .status(400)
          .json(error.toJson('Contact Email Of Unity To Send First Entry is required'));
      }
      if (!familyBenefits) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Family Benefits is required');
        return res.status(400).json(error.toJson('Family Benefits is required'));
      }

      if (!whoIsResponsibleForFirstEntryId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Who Is Responsible For First Entry Id is required',
        );
        return res
          .status(400)
          .json(error.toJson('Who Is Responsible For First Entry Id is required'));
      }

      if (!firstEntryInUnityID) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity ID is required');
        return res.status(400).json(error.toJson('First Entry In Unity ID is required'));
      }

      const newFirstEntryInUnity = new FirstEntryInUnity(
        firstEntryInUnity,
        motivationForFirstEntry,
        familyBenefits,
        true,
        new Date(),
        new Date(),
        nameOfUnityToSendFirstEntry,
        ContactEmailOfUnityToSendFirstEntry,
        firstEntryInUnity,
      );

      const firstEntryInUnityCreated = await userController.firstEntryInUnity(
        newFirstEntryInUnity,
        firstEntryInUnityID,
      );
      return res.status(201).json(firstEntryInUnityCreated);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
