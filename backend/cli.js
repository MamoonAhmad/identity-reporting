#!/usr/bin/env node


import express from 'express';
import cors from 'cors';
import { urlLoggerMiddleware } from './utils/server.js';
import http from 'http';
import { Server } from 'socket.io';

import { registerExpressEndpoints as registerTestSuiteEndpoints } from "./entities/TestSuite/endpoints.js"
import { registerExpressEndpoints as registerExecutedFunctionEndpoints } from './entities/ExecutedFunction/endpoints.js';
import { registerSocketEndpoints as registerTestRunSocketEndpoints, registerExpressEndpoints as registerTestRunEndpoints } from './entities/TestRun/endpoints.js';
import { registerExpressEndpoints as registerUserSettingEndpoints } from './entities/UserSetting/endpoints.js';







const app = express();

const server = http.createServer(app);
const socketIOInstance = new Server(server, {
    cors: {
        origin: '*',
    }
});

socketIOInstance.on('connection', (socket) => {
    console.log('SocketIO: A user connected');
    registerTestRunSocketEndpoints(socketIOInstance, socket);

    socket.on('disconnect', () => {
        console.log('SocketIO: User disconnected');
    });
});

app.use(express.json({ limit: '10mb' }))
app.use(cors({
    origin: '*'
}))
app.use(urlLoggerMiddleware)

const PORT = process.env.PORT || 8002;

server.listen(8002)

registerExecutedFunctionEndpoints(app);
registerTestSuiteEndpoints(app);
registerTestRunEndpoints(app);
registerUserSettingEndpoints(app);
