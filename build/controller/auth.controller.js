var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { validateRegister, validateLogin } from '../schemas/schemas.js';
import { KanbanDB } from '../model/db-kanban.js';
dotenv.config();
const SECRET_KEY = (_a = process.env.SECRET_KEY) !== null && _a !== void 0 ? _a : '123456';
export class AuthController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validateRequest = validateLogin(req.body);
            if (validateRequest.error) {
                return res.status(400).json({ error: JSON.parse(validateRequest.error.message) });
            }
            const user = req.body;
            const username = yield KanbanDB.searchUser(user.username);
            if ('message' in username) {
                return res.status(username.code).send(username.message);
            }
            if (username.username == '') {
                return res.status(401).send('Incorrect username or password');
            }
            const pass = yield KanbanDB.getPassword(username.username);
            if ('message' in pass) {
                return res.status(pass.code).send(pass.message);
            }
            if (!(yield bcrypt.compare(user.passwd, pass.passwd))) {
                return res.status(401).send('Incorrect username or password');
            }
            const user_id = yield KanbanDB.getID(username.username);
            if ('message' in user_id) {
                return res.status(user_id.code).send(user_id.message);
            }
            const token = jwt.sign({ user_id: user_id.id }, SECRET_KEY, {
                expiresIn: '5h'
            });
            res.cookie('access_token', token, { httpOnly: true, sameSite: 'strict' }).send({ user_id: user_id, token });
        });
    }
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validateRequest = validateRegister(req.body);
            if (validateRequest.error) {
                return res.status(400).json({ error: JSON.parse(validateRequest.error.message) });
            }
            const user = req.body;
            const username = yield KanbanDB.searchUser(user.username);
            if ('message' in username) {
                return res.status(username.code).send(username.message);
            }
            if (username.username !== '') {
                return res.status(401).send('Username already exists');
            }
            const hashedPasswd = yield bcrypt.hash(user.passwd, 7);
            const created_user = yield KanbanDB.addUser(user.username, hashedPasswd, user.email);
            if ('message' in created_user) {
                return res.status(created_user.code).send(created_user.message);
            }
            res.send(created_user);
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie('access_token').json({ message: 'Logout successful' });
        });
    }
}
