import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import { HelphyConditionStruct, HelphyCondition } from '../../../../domain/entity/healthCondition.ts';
import { HelphyConditionFamily } from '../../../../domain/entity/familyHelphyCondition.ts';
import { Pregnant } from '../../../../domain/entity/familyComposition.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerHealthConditionRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/health/condition/observation', async (req, res) => {
    try {
      const { helphyConditionId, whoIsObservingId, bodyObservation, observation } = req.body;
      const observationValue = bodyObservation ?? observation;

      if (!helphyConditionId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Helphy Condition Id is required');
        return res.status(400).json(error.toJson('Helphy Condition Id is required'));
      }
      if (!observationValue) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }

      const observationEntity = new Observations(observationValue, whoIsObservingId);
      const observationCreated = await userController.createHelphyConditionObservation(
        helphyConditionId,
        observationEntity,
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

  router.post('/create/health/condition', async (req, res) => {
    try {
      const {
        hasFamilyMemberNeedsConstantCare,
        hasFamilyMemberNeedsConstantCareList,
        hasFamilyMemberHasAlimentarInsecure,
        hasFamilyMemberUsesControlledMedication,
        hasFamilyMemberUsesControlledMedicationList,
        hasFamilyMemberAbusesAlcohol,
        hasFamilyMemberAbusesAlcoholList,
        hasFamilyMemberAbusesDrugs,
        hasFamilyMemberAbusesDrugsList,
        hasFamilyMemberSevereIllness,
        hasFamilyMemberSevereIllnessList,
        helphyConditionId,
        typeOfDeficiency,
        hasHelphyNeeds,
        whoIsResponsibleForHelp,
        pregnancyMonths,
        hasPreNatal,
        familyCompositionID,
        personId,
      } = req.body;

      if (!(typeof hasFamilyMemberNeedsConstantCare == 'boolean') || hasFamilyMemberNeedsConstantCare == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Needs Constant Care is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Needs Constant Care is required'));
      }

      if (!hasFamilyMemberNeedsConstantCareList) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Needs Constant Care List is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Needs Constant Care List is required'));
      }

      if (
        !(typeof hasFamilyMemberHasAlimentarInsecure == 'boolean') ||
        hasFamilyMemberHasAlimentarInsecure == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Has Alimentar Insecure is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Has Alimentar Insecure is required'));
      }

      if (
        !(typeof hasFamilyMemberUsesControlledMedication == 'boolean') ||
        hasFamilyMemberUsesControlledMedication == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Uses Controlled Medication is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Uses Controlled Medication is required'));
      }

      if (!hasFamilyMemberUsesControlledMedicationList) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Uses Controlled Medication List is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Uses Controlled Medication List is required'));
      }

      if (!(typeof hasFamilyMemberAbusesAlcohol == 'boolean') || hasFamilyMemberAbusesAlcohol == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Abuses Alcohol is required',
        );
        return res.status(400).json(error.toJson('Has Family Member Abuses Alcohol is required'));
      }

      if (!hasFamilyMemberAbusesAlcoholList) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Abuses Alcohol List is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Abuses Alcohol List is required'));
      }

      if (!(typeof hasFamilyMemberAbusesDrugs == 'boolean') || hasFamilyMemberAbusesDrugs == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Abuses Drugs is required',
        );
        return res.status(400).json(error.toJson('Has Family Member Abuses Drugs is required'));
      }

      if (!hasFamilyMemberAbusesDrugsList) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Abuses Drugs List is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Abuses Drugs List is required'));
      }

      if (!(typeof hasFamilyMemberSevereIllness == 'boolean') || hasFamilyMemberSevereIllness == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Severe Illness is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Severe Illness is required'));
      }

      if (!hasFamilyMemberSevereIllnessList) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Family Member Severe Illness List is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Family Member Severe Illness List is required'));
      }

      if (!helphyConditionId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Helphy Condition Id is required');
        return res.status(400).json(error.toJson('Helphy Condition Id is required'));
      }

      if (!typeOfDeficiency) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Type Of Deficiency is required');
        return res.status(400).json(error.toJson('Type Of Deficiency is required'));
      }

      if (!(typeof hasHelphyNeeds == 'boolean') || hasHelphyNeeds == null) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Has Helphy Needs is required');
        return res.status(400).json(error.toJson('Has Helphy Needs is required'));
      }

      if (!whoIsResponsibleForHelp) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Responsible For Help is required');
        return res.status(400).json(error.toJson('Who Is Responsible For Help is required'));
      }

      if (pregnancyMonths === null || pregnancyMonths === undefined || pregnancyMonths === '') {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Pregnancy Months is required');
        return res.status(400).json(error.toJson('Pregnancy Months is required'));
      }

      if (!(typeof hasPreNatal == 'boolean') || hasPreNatal == null) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Has Pre Natal is required');
        return res.status(400).json(error.toJson('Has Pre Natal is required'));
      }

      if (!familyCompositionID) {
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

      const hasFamilyMemberNeedsConstantCareListStruct: HelphyConditionStruct[] = [];
      const hasFamilyMemberUsesControlledMedicationListStruct: HelphyConditionStruct[] = [];
      const hasFamilyMemberAbusesAlcoholListStruct: HelphyConditionStruct[] = [];
      const hasFamilyMemberAbusesDrugsListStruct: HelphyConditionStruct[] = [];
      const hasFamilyMemberSevereIllnessListStruct: HelphyConditionStruct[] = [];

      for (const familyMemberneedsConstantCarePerson of hasFamilyMemberNeedsConstantCareList) {
        const struct = new HelphyConditionStruct(
          familyMemberneedsConstantCarePerson['name'],
          familyMemberneedsConstantCarePerson['complement'],
        );
        hasFamilyMemberNeedsConstantCareListStruct.push(struct);
      }

      for (const familyMemberUsesControlledMedicationPerson of hasFamilyMemberUsesControlledMedicationList) {
        const struct = new HelphyConditionStruct(
          familyMemberUsesControlledMedicationPerson['name'],
          '',
        );
        hasFamilyMemberUsesControlledMedicationListStruct.push(struct);
      }

      for (const familyMemberAbusesAlcoholPerson of hasFamilyMemberAbusesAlcoholList) {
        const struct = new HelphyConditionStruct(familyMemberAbusesAlcoholPerson['name'], '');
        hasFamilyMemberAbusesAlcoholListStruct.push(struct);
      }

      for (const familyMemberAbusesDrugsPerson of hasFamilyMemberAbusesDrugsList) {
        const struct = new HelphyConditionStruct(
          familyMemberAbusesDrugsPerson['name'],
          familyMemberAbusesDrugsPerson['complement'],
        );
        hasFamilyMemberAbusesDrugsListStruct.push(struct);
      }

      for (const familyMemberSevereIllnessPerson of hasFamilyMemberSevereIllnessList) {
        const struct = new HelphyConditionStruct(familyMemberSevereIllnessPerson['name'], '');
        hasFamilyMemberSevereIllnessListStruct.push(struct);
      }

      const helphyCondition = new HelphyCondition(
        hasFamilyMemberNeedsConstantCare,
        hasFamilyMemberNeedsConstantCareListStruct,
        hasFamilyMemberHasAlimentarInsecure,
        hasFamilyMemberSevereIllness,
        hasFamilyMemberSevereIllnessListStruct,
        hasFamilyMemberUsesControlledMedication,
        hasFamilyMemberUsesControlledMedicationListStruct,
        hasFamilyMemberAbusesAlcohol,
        hasFamilyMemberAbusesAlcoholListStruct,
        hasFamilyMemberAbusesDrugs,
        hasFamilyMemberAbusesDrugsListStruct,
        new Date(),
        new Date(),
      );
      const helphyConditionFamilyStruct = new HelphyConditionFamily(
        typeOfDeficiency,
        hasHelphyNeeds,
        whoIsResponsibleForHelp,
      );
      const helphyConditionPregnant = new Pregnant(pregnancyMonths, hasPreNatal, true);

      const helphyConditionCreated = await userController.createHelphyCondition(
        helphyCondition,
        helphyConditionId,
        helphyConditionFamilyStruct,
        familyCompositionID,
        personId,
        helphyConditionPregnant,
      );

      return res.status(201).json(helphyConditionCreated);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
