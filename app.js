const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory data stores
let users = [
    { id: uuidv4(), username: 'funcionario1', password: 'password1' },
    { id: uuidv4(), username: 'julio.lima', password: '123456' }
];

let rooms = [
    { id: uuidv4(), name: 'Sala Alpha', capacity: 10 },
    { id: uuidv4(), name: 'Sala Beta', capacity: 8 },
    { id: uuidv4(), name: 'Sala Gamma', capacity: 12 }
];

let appointments = [];

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gerenciamento de Salas de Reunião',
            version: '1.0.0',
            description: 'API para agendamento e gerenciamento de salas de reunião de uma empresa.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ['./app.js'], // files containing annotations for the OpenAPI specification
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de autenticação
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = Buffer.from(token, 'base64').toString('utf8');
    const [userIdFromToken, timestampFromToken] = decodedToken.split(':');
    const user = users.find(u => u.id === userIdFromToken); // Simplistic token validation

    if (!user) {
        return res.status(403).json({ message: 'Token de autenticação inválido.' });
    }

    req.user = user;
    next();
};

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para autenticação de usuários
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza o login do usuário e retorna um token de autenticação (ID do usuário).
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário.
 *               password:
 *                 type: string
 *                 description: Senha do usuário.
 *     responses:
 *       200:
 *         description: Login bem-sucedido. Retorna o ID do usuário como token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de autenticação (ID do usuário).
 *       401:
 *         description: Credenciais inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Credenciais inválidas.
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
        res.json({ token }); // Using base64 encoded user ID and timestamp as a simplistic token
    } else {
        res.status(401).json({ message: 'Credenciais inválidas.' });
    }
});

// Rotas protegidas por autenticação
app.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Salas
 *   description: Gerenciamento de salas de reunião
 */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Lista todas as salas de reunião disponíveis.
 *     tags: [Salas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uma lista de salas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: ID único da sala.
 *                   name:
 *                     type: string
 *                     description: Nome da sala.
 *                   capacity:
 *                     type: integer
 *                     description: Capacidade da sala.
 */
app.get('/rooms', (req, res) => {
    res.json(rooms);
});

/**
 * @swagger
 * tags:
 *   name: Agendamentos
 *   description: Gerenciamento de agendamentos de salas
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Agenda uma sala para um horário específico.
 *     tags: [Agendamentos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - startTime
 *               - endTime
 *             properties:
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da sala a ser agendada.
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Horário de início do agendamento (ISO 8601).
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Horário de término do agendamento (ISO 8601).
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: ID do agendamento.
 *                 roomId:
 *                   type: string
 *                   format: uuid
 *                   description: ID da sala agendada.
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                   description: ID do usuário que fez o agendamento.
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   description: Horário de início.
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   description: Horário de término.
 *       400:
 *         description: Erro de validação ou conflito de agendamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sala não encontrada ou Conflito de agendamento.
 */
app.post('/appointments', (req, res) => {
    const { roomId, startTime, endTime } = req.body;
    const userId = req.user.id;

    const roomExists = rooms.some(room => room.id === roomId);
    if (!roomExists) {
        return res.status(400).json({ message: 'Sala não encontrada.' });
    }

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    if (newStartTime >= newEndTime) {
        return res.status(400).json({ message: 'A data de início deve ser anterior à data de término.' });
    }

    // Check for appointment conflicts
    const conflict = appointments.some(appt => {
        return appt.roomId === roomId &&
               ((newStartTime < new Date(appt.endTime) && newEndTime > new Date(appt.startTime)));
    });

    if (conflict) {
        return res.status(400).json({ message: 'Conflito de agendamento: a sala já está ocupada neste horário.' });
    }

    const newAppointment = {
        id: uuidv4(),
        roomId,
        userId,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString()
    };

    appointments.push(newAppointment);
    res.status(201).json(newAppointment);
});

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Lista todos os agendamentos existentes.
 *     tags: [Agendamentos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uma lista de agendamentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: ID do agendamento.
 *                   roomId:
 *                     type: string
 *                     format: uuid
 *                     description: ID da sala agendada.
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                     description: ID do usuário que fez o agendamento.
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     description: Horário de início.
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     description: Horário de término.
 */
app.get('/appointments', (req, res) => {
    res.json(appointments);
});

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancela um agendamento existente.
 *     tags: [Agendamentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do agendamento a ser cancelado.
 *     responses:
 *       204:
 *         description: Agendamento cancelado com sucesso.
 *       404:
 *         description: Agendamento não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Agendamento não encontrado.
 *       403:
 *         description: Não autorizado a cancelar este agendamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Você não tem permissão para cancelar este agendamento.
 */
app.delete('/appointments/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const appointmentIndex = appointments.findIndex(appt => appt.id === id);

    if (appointmentIndex === -1) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    if (appointments[appointmentIndex].userId !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para cancelar este agendamento.' });
    }

    appointments.splice(appointmentIndex, 1);
    res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});