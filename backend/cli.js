#!/usr/bin/env node


import express from 'express';
import cors from 'cors';
import { urlLoggerMiddleware } from './utils/server.js';
import http from 'http';
import { Server } from 'socket.io';

import { registerExpressEndpoints as registerTestSuiteEndpoints } from "./entities/TestSuite/endpoints.js"
import { registerExpressEndpoints as registerExecutedFunctionEndpoints, registerSocketEndpoints as registerExecutedFunctionSocketEndpoints } from './entities/ExecutedFunction/endpoints.js';
import { registerSocketEndpoints as registerTestRunSocketEndpoints, registerExpressEndpoints as registerTestRunEndpoints } from './entities/TestRun/endpoints.js';
import { registerExpressEndpoints as registerUserSettingEndpoints } from './entities/UserSetting/endpoints.js';
import { getSocketListeners, registerEndpoints as registerClientAppEndpoints } from './clientApp.js';







const app = express();

const server = http.createServer(app);
const socketIOInstance = new Server(server, {
    cors: {
        origin: '*',
    }
});

let socketActionCallbacksMap = null
socketIOInstance.on('connection', (socket) => {
    console.log('SocketIO: A user connected');

    if (!socketActionCallbacksMap) {
        socketActionCallbacksMap = prepareSocketListeners()
    }
    // registerTestRunSocketEndpoints(socketIOInstance, socket);
    // registerExecutedFunctionSocketEndpoints(socketIOInstance, socket);
    
    socket.on("message", async (data) => {
        if (!data.action) {
            return socket.emit("error", "Invalid socket message. Missing action.")
        }
        if (!data.payload) {
            return socket.emit("error", "Invalid socket message. Missing payload.")
        }
        if (!socketActionCallbacksMap[data.action]) {
            return socket.emit("error", "Invalid action.")
        }

        try {
            const res = socketActionCallbacksMap[data.action](
                socketIOInstance, socket, data
            )
            if (res instanceof Promise) {
                await res
            }
        } catch (e) {
            socket.emit(`${data.action}:error`, `Error occurred while trying to execute a socket action.\n${e?.toString()}`)
        }
    })

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
registerClientAppEndpoints(app);


const prepareSocketListeners = () => {
    
    const socket = { on: () => { } }
    const testRunCallbacks = registerTestRunSocketEndpoints(socketIOInstance, socket);
    const executedFunctionCallbacks = registerExecutedFunctionSocketEndpoints(socketIOInstance, socket)

    return {
        ...testRunCallbacks,
        ...executedFunctionCallbacks,
        ...getSocketListeners()
    }
}
