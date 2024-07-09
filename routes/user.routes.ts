import { Router, Request } from 'express';
import { UserController } from '../controller/user.controller';

export const userRouter = Router();


interface CustomRequest extends Request {
  session: {
      user: any;
  };
}

userRouter.use((req, res, next) => {
  UserController.checkSession(req as CustomRequest, res, next);
});

const routes = [
  { method: 'get', path: '/', handler: UserController.getUserData },
  { method: 'post', path: '/section', handler: UserController.createSection },
  { method: 'delete', path: '/section', handler: UserController.deleteSection },
  { method: 'post', path: '/card', handler: UserController.createCard },
  { method: 'delete', path: '/card', handler: UserController.deleteCard },
  { method: 'patch', path: '/account', handler: UserController.updateAccount }
];

routes.forEach(route => {
  userRouter[route.method](route.path, route.handler);
});