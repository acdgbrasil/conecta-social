import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import { FamilyHistorySocioEducation } from '../../../../domain/entity/familyHistorySocioEducation.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerSocioEducationalRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/history/socio/educational/measures/observations', async (req, res) => {
    try {
      const { familyHistoryOfComplianseSocioEducationalMensureId, observation, whoIsObservingId } = req.body;
      if (!familyHistoryOfComplianseSocioEducationalMensureId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family History Of Compliance Socio Educational Mensure Id is required',
        );
        return res
          .status(400)
          .json(
            error.toJson('Family History Of Compliance Socio Educational Mensure Id is required'),
          );
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
      const observationCreated =
        await userController.createFamilyHistoryOfComplianseSocioEducationalMensureObservation(
          familyHistoryOfComplianseSocioEducationalMensureId,
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

  router.post('/create/history/socio/educational/measures', async (req, res) => {
    try {
      const {
        laOrPSCInfomation,
        dateInitJson,
        dateOfFinishJson,
        numberOfProcess,
        type,
        createFamilyHistoryOfComplianseSocioEducationalMensureId,
        familyCompositionId,
        personId,
        anotationsOfPersons,
      } = req.body;

      if (!typeof (laOrPSCInfomation == 'boolean') || laOrPSCInfomation == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'La Or PSC Infomation is required',
        );
        return res.status(400).json(error.toJson('La Or PSC Infomation is required'));
      }

      if (!dateInitJson) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date Init is required');
        return res.status(400).json(error.toJson('Date Init is required'));
      }

      if (!dateOfFinishJson) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date Of Finish is required');
        return res.status(400).json(error.toJson('Date Of Finish is required'));
      }

      if (!numberOfProcess) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Number Of Process is required');
        return res.status(400).json(error.toJson('Number Of Process is required'));
      }

      if (!type) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Type is required');
        return res.status(400).json(error.toJson('Type is required'));
      }

      if (!createFamilyHistoryOfComplianseSocioEducationalMensureId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Create Family History Of Complianse Socio Educational Mensure Id is required',
        );
        return res
          .status(400)
          .json(
            error.toJson('Create Family History Of Complianse Socio Educational Mensure Id is required'),
          );
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

      if (!anotationsOfPersons) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Anotations Of Persons is required');
        return res.status(400).json(error.toJson('Anotations Of Persons is required'));
      }

      const dateInit = new Date(dateInitJson);
      const dateOfFinish = new Date(dateOfFinishJson);
      const familyHistorySocioEducation = new FamilyHistorySocioEducation(
        dateInit,
        dateOfFinish,
        numberOfProcess,
        type,
        true,
      );

      const familyHistoryOfComplianceSocioEducationalMeasuresCreated =
        await userController.createFamilyHistoryOfComplianseSocioEducationalMensure(
          laOrPSCInfomation,
          createFamilyHistoryOfComplianseSocioEducationalMensureId,
          familyHistorySocioEducation,
          familyCompositionId,
          personId,
          anotationsOfPersons,
        );

      return res.status(201).json(familyHistoryOfComplianceSocioEducationalMeasuresCreated);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        console.log(e);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
