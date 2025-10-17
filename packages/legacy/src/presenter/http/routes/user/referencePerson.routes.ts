import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import { ReferencePerson } from '../../../../domain/entity/referencePerson.ts';
import { converterDataStringParaIsoUtc } from '../../../../shared/libs/formatings/dateFormater.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerReferencePersonRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.get('/list/reference/person/observation/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const referencePerson = await userController.getReferencePersonWithObservations(id);
      return res.status(200).json(referencePerson);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

  router.get('/list/reference/person/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const referencePerson = await userController.getByIdReferencePerson(id);
      return res.status(200).json(referencePerson);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

  router.get('/list/reference/person', async (_req, res) => {
    try {
      const referencePerson = await userController.listAllReferencePerson();
      return res.status(200).json(referencePerson);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

  router.get('/list/reduced/reference/person', async () => {
    throw new Error('Not Implemented');
  });

  router.post('/create/reference/person/observation', async (req, res) => {
    const { observation, whoIsObservingId, referencePersonId } = req.body;
    try {
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }
      if (!referencePersonId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Reference Person Id is required');
        return res.status(400).json(error.toJson('Reference Person Id is required'));
      }
      const newObservation = new Observations(observation, whoIsObservingId);
      const observationCreated = await userController.createReferencePersonObservation(
        newObservation,
        referencePersonId,
      );
      return res.status(201).json(observationCreated);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

  router.post('/create/reference/person', async (req, res) => {
    try {
      const {
        fullName,
        socialName,
        motherName,
        cpf,
        nis,
        diagnosis,
        rgNumber,
        rgUf,
        rgIssue,
        rgDateIssue,
        isShelter,
        localLocalization,
        cep,
        adress,
        neighborhood,
        adressNumber,
        adressComplement,
        state,
        city,
        phone,
        whoIsObservingId,
        birthDate,
        biologicalGender,
      } = req.body;

      if (!birthDate) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
        return res.status(400).json(error.toJson('Birth Date is required'));
      }

      if (!biologicalGender) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'biologicalGender is required');
        return res.status(400).json(error.toJson('biologicalGender is required'));
      }

      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }

      const requiredStringFields: Array<[string | undefined, string]> = [
        [fullName, 'Full Name'],
        [socialName, 'Social Name'],
        [motherName, 'Mother Name'],
        [cpf, 'Cpf'],
        [diagnosis, 'Diagnosis'],
        [rgNumber, 'Rg Number'],
        [rgUf, 'Rg Uf'],
        [rgIssue, 'Rg Issue'],
        [rgDateIssue, 'Rg Date Issue'],
        [localLocalization, 'Local Localization'],
        [adress, 'Adress'],
        [neighborhood, 'Neighborhood'],
        [adressNumber, 'Adress Number'],
        [adressComplement, 'Adress Complement'],
        [state, 'State'],
        [city, 'City'],
        [phone, 'Phone'],
      ];

      for (const [value, label] of requiredStringFields) {
        if (!value) {
          const error = new CustomError('Bad Request', 400, 'Bad Request', `${label} is required`);
          return res.status(400).json(error.toJson(`${label} is required`));
        }
      }

      if (!(typeof isShelter == 'boolean') || isShelter == null) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Is Shelter is required');
        return res.status(400).json(error.toJson('Is Shelter is required'));
      }

      const convertCorrectFormat = converterDataStringParaIsoUtc(birthDate);
      const birthDateFormatted = new Date(convertCorrectFormat);
      const newReferencePerson = new ReferencePerson(
        '0',
        fullName,
        socialName,
        motherName,
        nis,
        cpf,
        diagnosis,
        rgNumber,
        biologicalGender,
        rgUf,
        rgIssue,
        rgDateIssue,
        isShelter,
        localLocalization,
        cep,
        adress,
        neighborhood,
        adressNumber,
        adressComplement,
        state,
        city,
        phone,
        birthDateFormatted,
        whoIsObservingId,
      );
      const referencePerson = await userController.createReferencePerson(newReferencePerson);
      return res.status(201).json(referencePerson);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
    }
  });
};
