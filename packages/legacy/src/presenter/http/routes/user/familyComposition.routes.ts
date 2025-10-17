import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import {
  Documents,
  EducationConditionPerson,
  OcurruncyBolsaFamilia,
  FamilyCompositionPerson,
} from '../../../../domain/entity/familyComposition.ts';

export const registerFamilyCompositionRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.get('/list/composition/family/information/litery/:familyCompositionId', async (req, res) => {
    try {
      const familyCompositionId = req.params['familyCompositionId'];
      const information = await userController.getInformationOfPersonAndAgeAreInSchool(
        familyCompositionId,
      );
      return res.status(200).json(information);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.get('a/:familyCompositionId', async (req, res) => {
    try {
      const familyCompositionId = req.params['familyCompositionId'];

      if (!familyCompositionId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Family Composition Id is required');
        return res.status(400).json(error.toJson('Family Composition Id is required'));
      }

      const referencePerson = await userController.getFamilyCompositonPersons(familyCompositionId);
      return res.status(200).json(referencePerson);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/educational/especifications', async (req, res) => {
    try {
      const {
        literaty,
        schoolShip,
        isStudying,
        occurentDate,
        efect,
        suspensionSolicitation,
        familyCompositionID,
        personId,
      } = req.body;

      if (!(typeof literaty == 'boolean') || literaty == null) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Literaty is required');
        return res.status(400).json(error.toJson('Literaty is required'));
      }

      if (!schoolShip) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'School Ship is required');
        return res.status(400).json(error.toJson('School Ship is required'));
      }

      if (!(typeof isStudying == 'boolean') || isStudying == null) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Is Studying is required');
        return res.status(400).json(error.toJson('Is Studying is required'));
      }

      if (!occurentDate) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Occurent Date is required');
        return res.status(400).json(error.toJson('Occurent Date is required'));
      }

      if (!efect) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'efect is required');
        return res.status(400).json(error.toJson('Educational Esp is required'));
      }

      if (!(typeof suspensionSolicitation == 'boolean') || suspensionSolicitation == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Suspension Solicitation is required',
        );
        return res.status(400).json(error.toJson('Suspension Solicitation is required'));
      }

      if (!familyCompositionID) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family Situation Id is required',
        );
        return res.status(400).json(error.toJson('Family Situation Id is required'));
      }

      if (!personId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Person Id is required');
        return res.status(400).json(error.toJson('Person Id is required'));
      }

      const occurentDateDate = new Date(occurentDate);

      const bolsaFamiliaEspecification = new OcurruncyBolsaFamilia(
        occurentDateDate,
        efect,
        suspensionSolicitation,
      );
      const educationalEspecifications = new EducationConditionPerson(
        true,
        literaty,
        schoolShip,
        isStudying,
        bolsaFamiliaEspecification,
      );

      const familyComposition = await userController.createEducationalEspecifications(
        educationalEspecifications,
        familyCompositionID,
        personId,
      );
      return res.status(201).json(familyComposition);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/family/composition/observation', async (req, res) => {
    try {
      const { observation, whoIsObservingId, familyCompositionID } = req.body;
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }
      if (!familyCompositionID) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Family Composition ID is required');
        return res.status(400).json(error.toJson('Family Composition ID is required'));
      }
      const newObservation = new Observations(observation, whoIsObservingId);
      const created = await userController.createFamilyCompositionObservation(
        newObservation,
        familyCompositionID,
      );
      return res.status(201).json(created);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/etinical/documents', async (req, res) => {
    try {
      const { document, familyCompositionID, personId } = req.body;

      if (!familyCompositionID) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Family Composition ID is required');
        return res.status(400).json(error.toJson('Family Composition ID is required'));
      }

      if (!personId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Kinship is required');
        return res.status(400).json(error.toJson('Kinship is required'));
      }

      const documents = new Documents(document[0], document[1], document[2], document[3], document[4]);

      const familyComposition = await userController.createDocuments(
        documents,
        familyCompositionID,
        personId,
      );
      return res.status(201).json(familyComposition);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/etnical/especifications', async (req, res) => {
    try {
      const { etnicalEspecifications, familyCompositionID } = req.body;
      if (!etnicalEspecifications) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Etnical Especifications is required');
        return res.status(400).json(error.toJson('Etnical Especifications is required'));
      }
      if (!familyCompositionID) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Family Composition ID is required');
        return res.status(400).json(error.toJson('Family Composition ID is required'));
      }
      const familyComposition = await userController.createEtnicalEspecifications(
        etnicalEspecifications,
        familyCompositionID,
      );
      return res.status(201).json(familyComposition);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/family/person', async (req, res) => {
    try {
      const { fullname, birthDate, biologicalGender, kinship, personWithDisabilities, familyPersonId } = req.body;

      if (!fullname) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
        return res.status(400).json(error.toJson('Full Name is required'));
      }
      if (!birthDate) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
        return res.status(400).json(error.toJson('Birth Date is required'));
      }

      if (!biologicalGender) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'biologicalGender is required');
        return res.status(400).json(error.toJson('biologicalGender is required'));
      }

      if (!kinship) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Kinship is required');
        return res.status(400).json(error.toJson('Kinship is required'));
      }

      if (!familyPersonId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Family Person Id is required');
        return res.status(400).json(error.toJson('Family Person Id is required'));
      }

      if (!(typeof personWithDisabilities == 'boolean') || personWithDisabilities == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Person With Disabilities is required',
        );
        return res.status(400).json(error.toJson('Person With Disabilities is required'));
      }

      const documents = new Documents(false, false, false, false, false);
      const dateArray = birthDate.split('/');
      const date = new Date(dateArray[2], dateArray[1], dateArray[0]);
      const familyCompositionPerson = new FamilyCompositionPerson(
        fullname,
        date,
        biologicalGender,
        personWithDisabilities,
        documents,
        kinship,
      );
      const familyPerson = await userController.createFamilyPerson(
        familyCompositionPerson,
        familyPersonId,
      );
      return res.status(201).json(familyPerson);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
