import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import { FamilyComunitaryConvivation } from '../../../../domain/entity/familyComunitaryConvivation.ts';
import { FamilyAndCommunity } from '../../../../domain/entity/familyAndCommunity.ts';
import { FamilyEventlyBenefits } from '../../../../domain/entity/familyEnvetlyBenefits.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerFamilyCommunityRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/family/comunitary/convivation/person', async (req, res) => {
    try {
      const { dateOfInitJson, dateOfFinishJson, unity, serviceType, familyCompositionID, personId } = req.body;

      if (!dateOfInitJson) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date Of Init is required');
        return res.status(400).json(error.toJson('Date Of Init is required'));
      }
      if (!dateOfFinishJson) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date Of Finish is required');
        return res.status(400).json(error.toJson('Date Of Finish is required'));
      }
      if (!unity) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Unity is required');
        return res.status(400).json(error.toJson('Unity is required'));
      }
      if (!serviceType) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Service Type is required');
        return res.status(400).json(error.toJson('Service Type is required'));
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

      const dateOfInit = new Date(dateOfInitJson);
      const dateOfFinish = new Date(dateOfFinishJson);
      const familyComunitaryConvivation = new FamilyComunitaryConvivation(
        dateOfInit,
        dateOfFinish,
        unity,
        serviceType,
      );
      const created = await userController.createFamilyComunitaryConvivationPerson(
        familyComunitaryConvivation,
        familyCompositionID,
        personId,
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

  router.post('/create/family/community/observation', async (req, res) => {
    try {
      const { observation, whoIsObservingId, familyAndCommunityId } = req.body;
      if (!observation) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }
      if (!familyAndCommunityId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family And Community Id is required',
        );
        return res.status(400).json(error.toJson('Family And Community Id is required'));
      }
      const observationSchema = new Observations(observation, whoIsObservingId);
      const observationCreated = await userController.createFamilyAndCommunityObservation(
        familyAndCommunityId,
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

  router.post('/create/family/community', async (req, res) => {
    try {
      const {
        yearsInState,
        awaysLivingInState,
        yearsInDistrict,
        awaysLivingInDistrict,
        yearsInNeighborhood,
        awaysLivingInNeighborhood,
        hasVictimOfThreatsOrDiscrimination,
        hasNearbySupportNetwork,
        hasNeighborSupportNetwork,
        hasParticipatesInSupportGroups,
        hasParticipatesInSocialMovements,
        hasNoAccessToLeisureActivities,
        hasElderWithoutLeisureOrSocialInteraction,
        hasDependentsLeftAloneAtHome,
        relationshipEvaluationByTechnician,
        parentChildRelationshipEvaluation,
        siblingRelationshipEvaluation,
        conflictWithOtherResidents,
        familyAndCommunityId,
      } = req.body;

      if (!yearsInState) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Years In State is required');
        return res.status(400).json(error.toJson('Years In State is required'));
      }

      if (!(typeof awaysLivingInState == 'boolean') || awaysLivingInState == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Aways Living In State is required',
        );
        return res.status(400).json(error.toJson('Aways Living In State is required'));
      }

      if (!yearsInDistrict) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Years In District is required');
        return res.status(400).json(error.toJson('Years In District is required'));
      }

      if (!(typeof awaysLivingInDistrict == 'boolean') || awaysLivingInDistrict == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Aways Living In District is required',
        );
        return res.status(400).json(error.toJson('Aways Living In District is required'));
      }

      if (!yearsInNeighborhood) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Years In Neighborhood is required');
        return res.status(400).json(error.toJson('Years In Neighborhood is required'));
      }

      if (!(typeof awaysLivingInNeighborhood == 'boolean') || awaysLivingInNeighborhood == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Aways Living In Neighborhood is required',
        );
        return res.status(400).json(error.toJson('Aways Living In Neighborhood is required'));
      }

      if (
        !(typeof hasVictimOfThreatsOrDiscrimination == 'boolean') ||
        hasVictimOfThreatsOrDiscrimination == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Victim Of Threats Or Discrimination is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Victim Of Threats Or Discrimination is required'));
      }

      if (!(typeof hasNearbySupportNetwork == 'boolean') || hasNearbySupportNetwork == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Nearby Support Network is required',
        );
        return res.status(400).json(error.toJson('Has Nearby Support Network is required'));
      }

      if (!(typeof hasNeighborSupportNetwork == 'boolean') || hasNeighborSupportNetwork == null) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Neighbor Support Network is required',
        );
        return res.status(400).json(error.toJson('Has Neighbor Support Network is required'));
      }

      if (
        !(typeof hasParticipatesInSupportGroups == 'boolean') ||
        hasParticipatesInSupportGroups == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Participates In Support Groups is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Participates In Support Groups is required'));
      }

      if (
        !(typeof hasParticipatesInSocialMovements == 'boolean') ||
        hasParticipatesInSocialMovements == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Participates In Social Movements is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Participates In Social Movements is required'));
      }

      if (
        !(typeof hasNoAccessToLeisureActivities == 'boolean') ||
        hasNoAccessToLeisureActivities == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has No Access To Leisure Activities is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has No Access To Leisure Activities is required'));
      }

      if (
        !(typeof hasElderWithoutLeisureOrSocialInteraction == 'boolean') ||
        hasElderWithoutLeisureOrSocialInteraction == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Elder Without Leisure Or Social Interaction is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Elder Without Leisure Or Social Interaction is required'));
      }

      if (
        !(typeof hasDependentsLeftAloneAtHome == 'boolean') ||
        hasDependentsLeftAloneAtHome == null
      ) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Has Dependents Left Alone At Home is required',
        );
        return res
          .status(400)
          .json(error.toJson('Has Dependents Left Alone At Home is required'));
      }

      if (!relationshipEvaluationByTechnician) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Relationship Evaluation By Technician is required',
        );
        return res
          .status(400)
          .json(error.toJson('Relationship Evaluation By Technician is required'));
      }

      if (!parentChildRelationshipEvaluation) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Parent Child Relationship Evaluation is required',
        );
        return res
          .status(400)
          .json(error.toJson('Parent Child Relationship Evaluation is required'));
      }

      if (!siblingRelationshipEvaluation) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Sibling Relationship Evaluation is required',
        );
        return res
          .status(400)
          .json(error.toJson('Sibling Relationship Evaluation is required'));
      }

      if (!conflictWithOtherResidents) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Conflict With Other Residents is required',
        );
        return res.status(400).json(error.toJson('Conflict With Other Residents is required'));
      }

      if (!familyAndCommunityId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family And Community Id is required',
        );
        return res.status(400).json(error.toJson('Family And Community Id is required'));
      }

      const familyCommunity = new FamilyAndCommunity(
        yearsInState,
        awaysLivingInState,
        yearsInDistrict,
        awaysLivingInDistrict,
        yearsInNeighborhood,
        awaysLivingInNeighborhood,
        hasVictimOfThreatsOrDiscrimination,
        hasNearbySupportNetwork,
        hasNeighborSupportNetwork,
        hasParticipatesInSupportGroups,
        hasParticipatesInSocialMovements,
        hasNoAccessToLeisureActivities,
        hasElderWithoutLeisureOrSocialInteraction,
        hasDependentsLeftAloneAtHome,
        relationshipEvaluationByTechnician,
        parentChildRelationshipEvaluation,
        siblingRelationshipEvaluation,
        conflictWithOtherResidents,
        true,
      );
      const familyCommunityCreated = await userController.createFamilyAndCommunity(
        familyCommunity,
        familyAndCommunityId,
      );
      return res.status(201).json(familyCommunityCreated);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/evently/benefits', async (req, res) => {
    try {
      const { date, typeOfBenefit, nBirthDate, nCpf, familyEventlyBenefitsId } = req.body;

      if (!date) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Date is required');
        return res.status(400).json(error.toJson('Date is required'));
      }

      if (!typeOfBenefit) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Type Of Benefit is required');
        return res.status(400).json(error.toJson('Type Of Benefit is required'));
      }

      if (!nBirthDate) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
        return res.status(400).json(error.toJson('Birth Date is required'));
      }

      if (!nCpf) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Cpf is required');
        return res.status(400).json(error.toJson('Cpf is required'));
      }

      if (!familyEventlyBenefitsId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family Evently Benefits Id is required',
        );
        return res.status(400).json(error.toJson('Family Evently Benefits Id is required'));
      }

      const dateFormater = new Date(date);
      const eventlyBenefit = new FamilyEventlyBenefits(
        dateFormater,
        typeOfBenefit,
        nBirthDate,
        nCpf,
        true,
      );
      const eventlyBenefitCreated = await userController.createFamilyEventlyBenefits(
        eventlyBenefit,
        familyEventlyBenefitsId,
      );

      return res.status(201).json(eventlyBenefitCreated);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};
