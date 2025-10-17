import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { Observations } from '../../../../domain/entity/observations.ts';
import {
  FamilySituationViolation,
  FamilySituationViolationStruct,
  FamilySituationViolationStructOther,
} from '../../../../domain/entity/familySituationViolation.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerViolenceSituationRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/violence/situation/observation', async (req, res) => {
    try {
      const { familySituationViolationId, observationText, whoIsObservingId } = req.body;
      if (!familySituationViolationId) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'Family Situation Violation Id is required',
        );
        return res.status(400).json(error.toJson('Family Situation Violation Id is required'));
      }
      if (!observationText) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        return res.status(400).json(error.toJson('Observation is required'));
      }
      if (!whoIsObservingId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        return res.status(400).json(error.toJson('Who Is Observing Id is required'));
      }

      const observation = new Observations(observationText, whoIsObservingId);
      const createdObservation = await userController.createSituationViolationObservation(
        familySituationViolationId,
        observation,
      );
      return res.status(201).json(createdObservation);
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.statusCode).json(e.toJson(e.message));
      } else {
        console.log(e);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  router.post('/create/violence/situation', async (req, res) => {
    try {
      const {
        childLabel,
        childLabelOcurrentNow,
        sexualExploitation,
        sexualExploitationOcurrentNow,
        sexualAbuse,
        sexualAbuseNow,
        physicalAbuse,
        physicalAbuseNow,
        psychologicalAbuse,
        psychologicalAbuseNow,
        elderNeglect,
        elderNeglectNow,
        childNeglect,
        childNeglectNow,
        pcdNeglect,
        pcdNeglectNow,
        homelessSituation,
        homelessSituationNow,
        humanTrafficking,
        humanTraffickingNow,
        violenceWithElderOrPcd,
        violenceWithElderOrPcdNow,
        otherName,
        otherNow,
        otherBool,
        violenceId,
      } = req.body;

      if (!violenceId) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Violence Id is required');
        return res.status(400).json(error.toJson('Violence Id is required'));
      }

      const booleanFields: Array<[boolean | null, string]> = [
        [childLabel, 'Child Label'],
        [childLabelOcurrentNow, 'Child Label Ocurrent Now'],
        [sexualExploitation, 'Sexual Exploitation'],
        [sexualExploitationOcurrentNow, 'Sexual Exploitation Ocurrent Now'],
        [sexualAbuse, 'Sexual Abuse'],
        [sexualAbuseNow, 'Sexual Abuse Now'],
        [physicalAbuse, 'Physical Abuse'],
        [physicalAbuseNow, 'Physical Abuse Now'],
        [psychologicalAbuse, 'Psychological Abuse'],
        [psychologicalAbuseNow, 'Psychological Abuse Now'],
        [elderNeglect, 'Elder Neglect'],
        [elderNeglectNow, 'Elder Neglect Now'],
        [childNeglect, 'Child Neglect'],
        [childNeglectNow, 'Child Neglect Now'],
        [pcdNeglect, 'Pcd Neglect'],
        [pcdNeglectNow, 'Pcd Neglect Now'],
        [homelessSituation, 'Homeless Situation'],
        [homelessSituationNow, 'Homeless Situation Now'],
        [humanTrafficking, 'Human Trafficking'],
        [humanTraffickingNow, 'Human Trafficking Now'],
        [violenceWithElderOrPcd, 'Violence With Elder Or Pcd'],
        [violenceWithElderOrPcdNow, 'Violence With Elder Or Pcd Now'],
        [otherNow, 'Other Now'],
        [otherBool, 'Other Bool'],
      ];

      for (const [value, label] of booleanFields) {
        if (!(typeof value == 'boolean') || value == null) {
          const error = new CustomError('Bad Request', 400, 'Bad Request', `${label} is required`);
          return res.status(400).json(error.toJson(`${label} is required`));
        }
      }

      if (!(typeof otherName == 'string') || otherName == null) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Other Name is required');
        return res.status(400).json(error.toJson('Other Name is required'));
      }

      const familySituation = new FamilySituationViolation(
        new FamilySituationViolationStruct(childLabel, childLabelOcurrentNow),
        new FamilySituationViolationStruct(sexualExploitation, sexualExploitationOcurrentNow),
        new FamilySituationViolationStruct(sexualAbuse, sexualAbuseNow),
        new FamilySituationViolationStruct(physicalAbuse, physicalAbuseNow),
        new FamilySituationViolationStruct(psychologicalAbuse, psychologicalAbuseNow),
        new FamilySituationViolationStruct(elderNeglect, elderNeglectNow),
        new FamilySituationViolationStruct(childNeglect, childNeglectNow),
        new FamilySituationViolationStruct(pcdNeglect, pcdNeglectNow),
        new FamilySituationViolationStruct(homelessSituation, homelessSituationNow),
        new FamilySituationViolationStruct(humanTrafficking, humanTraffickingNow),
        new FamilySituationViolationStruct(violenceWithElderOrPcd, violenceWithElderOrPcdNow),
        new FamilySituationViolationStructOther(otherBool, otherNow, otherName),
        true,
      );

      const created = await userController.createSituationViolation(familySituation, violenceId);
      return res.status(201).json(created);
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
