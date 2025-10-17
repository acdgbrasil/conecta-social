import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import { HomeConditions } from '../../../../domain/entity/homeConditions.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerHomeConditionRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/home/conditions/observation', async (req, res) => {
    try {
      const { observation, whoIsObservingId, homeConditionsId } = req.body;
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }
      if (!homeConditionsId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Home Conditions Id is required');
        return res.status(400).json(error.toJson('Home Conditions Id is required'));
      }
      const newObservation = new Observations(observation, whoIsObservingId);
      const created = await userController.createHomeConditionsObservation(newObservation, homeConditionsId);
      return res.status(201).json(created);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/home/conditions', async (req, res) => {
    try {
      const {
        typeResidence,
        materialOfExternalWalls,
        hasAcessEnergy,
        waterSupply,
        sewageDisposal,
        garbageCollection,
        hasWasteCollection,
        homeConditionIsInRiskArea,
        difficultyToAccessHome,
        hasHomeInsurance,
        hasHomeInsuranceValue,
        numberOfRooms,
        numberOfBedrooms,
        numberOfPeapleInBedrooms,
        homeConditionsId,
      } = req.body;

      const requiredStringFields: Array<[string, string]> = [
        [typeResidence, 'Type Residence'],
        [materialOfExternalWalls, 'Material Of External Walls'],
        [hasAcessEnergy, 'Has Acess Energy'],
        [waterSupply, 'Water Supply'],
        [sewageDisposal, 'Sewage Disposal'],
        [garbageCollection, 'Garbage Collection'],
        [hasHomeInsuranceValue, 'Has Home Insurance Value'],
        [numberOfRooms, 'Number Of Rooms'],
        [numberOfBedrooms, 'Number Of Bedrooms'],
        [numberOfPeapleInBedrooms, 'Number Of Peaple In Bedrooms'],
        [homeConditionsId, 'Home Conditions Id'],
      ];

      for (const [value, label] of requiredStringFields) {
        if (value === '' || value === null || value === undefined) {
          const error = new CustomError('Bad Request', 400, 'Bad Request', `${label} is required`);
          return res.status(400).json(error.toJson(`${label} is required`));
        }
      }

      const requiredBooleanFields: Array<[boolean | null, string]> = [
        [hasWasteCollection, 'Has Waste Collection'],
        [homeConditionIsInRiskArea, 'Home Condition Is In Risk Area'],
        [difficultyToAccessHome, 'Difficulty To Access Home'],
        [hasHomeInsurance, 'Has Home Insurance'],
      ];

      for (const [value, label] of requiredBooleanFields) {
        if (!(typeof value == 'boolean') || value == null) {
          const error = new CustomError('Bad Request', 400, 'Bad Request', `${label} is required`);
          return res.status(400).json(error.toJson(`${label} is required`));
        }
      }

      const homeConditions = new HomeConditions(
        typeResidence,
        materialOfExternalWalls,
        hasAcessEnergy,
        waterSupply,
        sewageDisposal,
        garbageCollection,
        hasWasteCollection,
        homeConditionIsInRiskArea,
        difficultyToAccessHome,
        hasHomeInsurance,
        hasHomeInsuranceValue,
        numberOfRooms,
        numberOfBedrooms,
        numberOfPeapleInBedrooms,
      );

      const created = await userController.createHomeConditions(homeConditions, homeConditionsId);
      return res.status(201).json(created);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
