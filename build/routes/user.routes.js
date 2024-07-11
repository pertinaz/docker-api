import { Router } from 'express';
import { UserController } from '../controller/user.controller.js';
export const userRouter = Router();
userRouter.use((req, res, next) => {
    UserController.checkSession(req, res, next);
});
userRouter.get('/', (req, res) => UserController.getUserData(req, res));
userRouter.post('/section', (req, res) => UserController.createSection(req, res));
userRouter.delete('/section', (req, res) => UserController.deleteSection(req, res));
userRouter.patch('/section', (req, res) => UserController.updateSection(req, res));
userRouter.post('/card', (req, res) => UserController.createCard(req, res));
userRouter.delete('/card', (req, res) => UserController.deleteCard(req, res));
userRouter.patch('/card', (req, res) => UserController.updateCard(req, res));
userRouter.patch('/account', (req, res) => UserController.updateAccount(req, res));
userRouter.get('/account', (req, res) => UserController.getUserInfo(req, res));
