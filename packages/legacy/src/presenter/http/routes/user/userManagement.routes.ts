import { Router } from 'express';
import { CustomError } from '../../../../infra/error/error.ts';
import { User, UserRole } from '../../../../domain/entity/user.ts';
import { UserController } from '../../../../useCase/controllers/userController.ts';

export const registerUserManagementRoutes = (
  router: Router,
  userController: UserController,
) => {
  router.post('/create/adm', async (req, res) => {
    try {
      const { email, fullName, admEmail } = req.body;
      const superAdmEmail = process.env.SUPER_ADM_EMAIL;
      const isSuperAdm = superAdmEmail === admEmail;

      if (!isSuperAdm) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'You are not allowed to create a new adm',
        );
        return res.status(400).json(error.toJson('You are not allowed to create a new adm'));
      }

      if (!email) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        return res.status(400).json(error.toJson('Email is required'));
      }
      if (!fullName) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
        return res.status(400).json(error.toJson('Full Name is required'));
      }
      const newUser = new User(0, fullName, email, 'Senh@123', null, UserRole.admin.toString(), new Date(), new Date(), true);
      const user = await userController.create(newUser, true);
      return res.status(201).json(user);
    } catch (e) {
      return res.status(500).json(e);
    }
  });

  router.post('/create/user', async (req, res) => {
    try {
      const { admEmail, email, fullName, crm } = req.body;
      if (!email) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        return res.status(400).json(error.toJson('Email is required'));
      }
      if (!fullName) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
        return res.status(400).json(error.toJson('Full Name is required'));
      }
      if (!crm) {
        const error = new CustomError('Bad Request', 400, 'Bad Request', 'Crm is required');
        return res.status(400).json(error.toJson('Crm is required'));
      }
      const isAdm = (await userController.findByEmail(admEmail) as User).role === UserRole.admin.toString();

      if (!isAdm) {
        const error = new CustomError(
          'Bad Request',
          400,
          'Bad Request',
          'You are not allowed to create a new user',
        );
        return res.status(400).json(error.toJson('You are not allowed to create a new user'));
      }

      const newUser = new User(0, fullName, email, 'Senh@123', crm, UserRole.user.toString(), new Date(), new Date(), true);
      const user = await userController.create(newUser, false);
      return res.status(201).json(user);
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  });
};
