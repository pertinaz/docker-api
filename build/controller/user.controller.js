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
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { KanbanDB } from '../model/db-kanban.js';
import { validate } from 'uuid';
dotenv.config();
const SECRET_KEY = (_a = process.env.SECRET_KEY) !== null && _a !== void 0 ? _a : '123456';
export class UserController {
    static checkSession(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.access_token;
            req.session = { user: null };
            if (!token) {
                return res.status(403).send('Forbidden request: You are not authorized');
            }
            try {
                const data = jwt.verify(token, SECRET_KEY);
                req.session.user = data;
            }
            catch (e) {
                return res.status(401).send('Forbidden request: You are not authorized');
            }
            next();
        });
    }
    static getUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const userData = yield KanbanDB.getAllUserSections(user_id);
            if ('message' in userData)
                return res.status(userData.code).send(userData.message);
            res.send(userData);
        });
    }
    static createSection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { title, position } = req.body;
            if (!title)
                return res.status(400).send("Bad request: missing title field");
            const section = yield KanbanDB.addSection(title, user_id, position);
            if ('message' in section)
                return res.status(section.code).send(section.message);
            res.status(201).send(section);
        });
    }
    static deleteSection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { section_id } = req.body;
            if (!validate(section_id))
                return res.status(400).send('Error: Incorrect UUID');
            const section_user_id = yield KanbanDB.getUserID(section_id);
            if ('message' in section_user_id)
                return res.status(section_user_id.code).send(section_user_id.message);
            if (section_user_id.id != user_id)
                return res.status(403).send('Forbidden request: The section doesnt belong to this user');
            const section_deleted = yield KanbanDB.deleteSection(section_id);
            if ('message' in section_deleted)
                return res.status(section_deleted.code).send(section_deleted.message);
            res.send(section_deleted);
        });
    }
    static createCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { title, content, section_id, position } = req.body;
            if (!title || !content || !section_id)
                return res.status(400).send("Bad request: missing fields");
            if (!validate(section_id))
                return res.status(401).send('Error: Incorrect UUID');
            const section_user_id = yield KanbanDB.getUserID(section_id);
            if ('message' in section_user_id)
                return res.status(section_user_id.code).send(section_user_id.message);
            if (section_user_id.id != user_id)
                return res.status(403).send('Forbidden request: The section doesnt belong to this user');
            const card = yield KanbanDB.addCards(title, content, section_id, position);
            if ('message' in card)
                return res.status(card.code).send(card.message);
            res.status(201).send(card);
        });
    }
    static deleteCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { card_id } = req.body;
            if (!card_id)
                return res.status(400).send("Bad request: missing card id field");
            if (!validate(card_id))
                return res.status(401).send('Error: Incorrect UUID');
            const section_id = yield KanbanDB.getSectionID(card_id);
            if ('message' in section_id)
                return res.status(section_id.code).send(section_id.message);
            const section_user_id = yield KanbanDB.getUserID(section_id.id);
            if ('message' in section_user_id)
                return res.status(section_user_id.code).send(section_user_id.message);
            if (section_user_id.id != user_id)
                return res.status(403).send('Forbidden request: The section doesnt belong to this user');
            const cardDeleted = yield KanbanDB.deleteCard(card_id);
            if ('message' in cardDeleted)
                return res.status(cardDeleted.code).send(cardDeleted.message);
            res.send(cardDeleted);
        });
    }
    static updateAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { username, email, password } = req.body;
            const userUpdated = yield KanbanDB.updateUser(user_id, { username, email, password });
            if ('message' in userUpdated)
                return res.status(userUpdated.code).send(userUpdated.message);
            res.send(userUpdated);
        });
    }
    static getUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const userData = yield KanbanDB.getUserInfo(user_id);
            if ('message' in userData)
                return res.status(userData.code).send(userData.message);
            res.send(userData);
        });
    }
    static updateSection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { title, position } = req.body;
            const sectionUpdated = yield KanbanDB.updateSection(user_id, { title, user_id, position });
            if ('message' in sectionUpdated)
                return res.status(sectionUpdated.code).send(sectionUpdated.message);
            res.send(sectionUpdated);
        });
    }
    static updateCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.session.user;
            const { title, content, card_id, section_id, position } = req.body;
            // verificar que el usuario sea el dueño de la sección que quiera cambiar
            // verificar que la seccion de la carta sea del usuario
            const cardUpdated = yield KanbanDB.updateCard(card_id, { title, content, section_id, position });
            if ('message' in cardUpdated)
                return res.status(cardUpdated.code).send(cardUpdated.message);
            res.send(cardUpdated);
        });
    }
}
