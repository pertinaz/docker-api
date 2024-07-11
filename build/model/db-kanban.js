var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { connect } from 'ts-postgres';
import bcrypt from 'bcrypt';
export class KanbanDB {
    static getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!KanbanDB.client) {
                KanbanDB.client = yield connect({
                    user: 'postgres',
                    host: 'localhost',
                    password: '123456',
                    database: 'kaban',
                    port: 5432
                });
            }
            return KanbanDB.client;
        });
    }
    static searchUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`SELECT username FROM users WHERE username = $1`, [username]);
                if (data.rows.length === 0)
                    return { username: '' };
                return { username: data.rows[0][0] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static getPassword(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`SELECT passwd FROM users WHERE username = $1`, [username]);
                if (data.rows.length > 0) {
                    return { passwd: data.rows[0][0] };
                }
                else {
                    return { message: 'Incorrect user name or password', code: 401 };
                }
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static getID(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`SELECT id FROM users WHERE username = $1`, [username]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró una id para el usuario especificado', code: 404 };
                return { id: data.rows[0][0] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static getAllUserSections(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                let userdata = { sections: [] };
                const sections_id = yield client.query(`SELECT title, id, position FROM section WHERE user_id = $1`, [user_id]);
                for (const section of sections_id.rows) {
                    const cards = yield client.query(`SELECT id, title, content, position FROM cards WHERE section_id = $1`, [section[1]]);
                    userdata.sections.push({ id: section[1], title: section[0], user_id: user_id, cards: cards.rows.map(card => ({ id: card[0], title: card[1], content: card[2], section_id: section[1], position: card[3] })), position: section[2] });
                }
                if (sections_id.rows.length === 0)
                    return { message: 'No se encontró seccion para la id especificada', code: 404 };
                return userdata;
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static getUserID(section_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`SELECT user_id FROM section WHERE id = $1`, [section_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró seccion para la id especificada', code: 404 };
                return { id: data.rows[0][0] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static getSectionID(card_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`SELECT section_id FROM cards WHERE id = $1`, [card_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró sección para la ID especificada', code: 404 };
                return { id: data.rows[0][0] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static addSection(title, user_id, position) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`INSERT INTO section (user_id, title, position) VALUES ($1, $2, $3) RETURNING *`, [user_id, title, position]);
                return { id: data.rows[0][0], title: data.rows[0][2], user_id: data.rows[0][1], cards: [], position: data.rows[0][3] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static addCards(title, content, section_id, position) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`INSERT INTO cards (title, content, section_id, position) VALUES ($1, $2, $3, $4) RETURNING *`, [title, content, section_id, position]);
                return { id: data.rows[0][0], title: data.rows[0][1], content: data.rows[0][2], section_id: data.rows[0][3], position: data.rows[0][4] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static addUser(username, hashedPasswd, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`INSERT INTO users (username, passwd, email) VALUES ($1, $2, $3) RETURNING *`, [username, hashedPasswd, email]);
                return { id: data.rows[0][0], username: data.rows[0][1], passwd: data.rows[0][2], email: data.rows[0][3] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static deleteSection(section_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`DELETE FROM section WHERE id = $1 RETURNING *`, [section_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró la seccion', code: 404 };
                const deletedCards = yield client.query(`DELETE FROM cards WHERE section_id = $1 RETURNING *`, [section_id]);
                const cards = deletedCards.rows.map(card => ({ id: card[0], title: card[1], content: card[2], section_id: card[3], position: card[4] }));
                return { id: data.rows[0][0], title: data.rows[0][1], user_id: data.rows[0][2], cards: cards, position: data.rows[0][4] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static deleteCard(card_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`DELETE FROM cards WHERE id = $1 RETURNING *`, [card_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró la carta', code: 404 };
                return { id: data.rows[0][0], title: data.rows[0][1], content: data.rows[0][2], section_id: data.rows[0][3], position: data.rows[0][4] };
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        });
    }
    static updateUser(user_id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (user_id, { username, email, password }) {
            try {
                const client = yield KanbanDB.getClient();
                const updates = [];
                const values = [];
                if (username) {
                    updates.push('username = $1');
                    values.push(username);
                }
                if (email) {
                    updates.push('email = $2');
                    values.push(email);
                }
                if (password) {
                    updates.push('passwd = $3');
                    values.push(yield bcrypt.hash(password, 7));
                }
                const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
                yield client.query(query, [...values, user_id]);
                const data = yield client.query('SELECT * FROM users WHERE id = $1', [user_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró el usuario especificado', code: 404 };
                return { id: data.rows[0][0], username: data.rows[0][1], passwd: data.rows[0][2], email: data.rows[0][3] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static updateSection(section_id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (section_id, { title, user_id, position }) {
            try {
                const client = yield KanbanDB.getClient();
                const updates = [];
                const values = [];
                if (title) {
                    updates.push('title = $1');
                    values.push(title);
                }
                if (user_id) {
                    updates.push('user_id = $2');
                    values.push(user_id);
                }
                if (position) {
                    updates.push('position = $4');
                    values.push(position);
                }
                const query = `UPDATE section SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
                yield client.query(query, [...values, section_id]);
                const data = yield client.query('SELECT * FROM section WHERE id = $1', [section_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró la seccion especificada', code: 404 };
                return { id: data.rows[0][0], title: data.rows[0][1], user_id: data.rows[0][2], position: data.rows[0][4] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static updateCard(card_id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (card_id, { title, content, section_id, position }) {
            try {
                const client = yield KanbanDB.getClient();
                const updates = [];
                const values = [];
                if (title) {
                    updates.push('title = $1');
                    values.push(title);
                }
                if (content) {
                    updates.push('content = $2');
                    values.push(content);
                }
                if (section_id) {
                    updates.push('section_id = $3');
                    values.push(section_id);
                }
                if (position) {
                    updates.push('position = $3');
                    values.push(position);
                }
                const query = `UPDATE cards SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
                yield client.query(query, [...values, card_id]);
                const data = yield client.query('SELECT * FROM cards WHERE id = $1', [card_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró el usuario especificado', code: 404 };
                return { id: data.rows[0][0], title: data.rows[0][1], content: data.rows[0][2], section_id: data.rows[0][3], position: data.rows[0][4] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
    static getUserInfo(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield KanbanDB.getClient();
                const data = yield client.query(`SELECT username, email FROM users WHERE id = $1`, [user_id]);
                if (data.rows.length === 0)
                    return { message: 'No se encontró un usuario para el id especificado', code: 404 };
                return { username: data.rows[0][0], email: data.rows[0][1] };
            }
            catch (e) {
                const error = { message: 'Error en la base de datos: ' + e.message, code: 500 };
                return error;
            }
        });
    }
}
KanbanDB.client = null;
