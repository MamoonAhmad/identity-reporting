#!/usr/bin/env node


import express, { Router } from 'express';
import path from 'path';
import cors from 'cors';
import { urlLoggerMiddleware } from './utils/server.js';
import http from 'http';
import { Server } from 'socket.io';

import { registerExpressEndpoints as registerTestSuiteEndpoints } from "./entities/TestSuite/endpoints.js"
import { registerExpressEndpoints as registerExecutedFunctionEndpoints, registerSocketEndpoints as registerExecutedFunctionSocketEndpoints } from './entities/ExecutedFunction/endpoints.js';
import { registerSocketEndpoints as registerTestRunSocketEndpoints } from './entities/TestRun/endpoints.js';
import { registerExpressEndpoints as registerUserSettingEndpoints } from './entities/UserSetting/endpoints.js';
import { registerEndpoints as registerClientAppEndpoints } from './clientApp.js';
import * as userSettingLoader from "./entities/UserSetting/loader.js"
import { logger } from './logger.js';


import { fileURLToPath } from 'url';


const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

const prepareSocketListeners = (socketIOInstance) => {

    const socket = { on: () => { } }
    const testRunCallbacks = registerTestRunSocketEndpoints(socketIOInstance, socket);
    const executedFunctionCallbacks = registerExecutedFunctionSocketEndpoints(socketIOInstance, socket)

    return {
        ...testRunCallbacks,
        ...executedFunctionCallbacks,
    }
}




export async function startServer() {

    userSettingLoader.assertConfigFileExists()
    let userSettings;

    userSettings = await userSettingLoader.getSettings()




    const app = express();

    const server = http.createServer(app);
    const socketIOInstance = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    let socketActionCallbacksMap = null
    if (!socketActionCallbacksMap) {
        socketActionCallbacksMap = prepareSocketListeners(socketIOInstance)
    }
    socketIOInstance.on('connection', (socket) => {
        console.log('SocketIO: A user connected');

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

    // Register REST API routes
    const apiRouter = express.Router()
    registerExecutedFunctionEndpoints(apiRouter);
    registerTestSuiteEndpoints(apiRouter);
    registerUserSettingEndpoints(apiRouter);
    registerClientAppEndpoints(apiRouter);

    app.use("/api", apiRouter);
    logger.debug("Registered API Routes on /api")

    // Serve React App Build
    app.use("/", (req, res, next) => {
        if (req.url.startsWith("/api") || req.url.startsWith("/assets") || req.url.startsWith("/socket.io")) {
            next()
        }

        else {
            res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'))
        }
    })

    // Static files
    app.use(express.static(path.join(__dirname, '../frontend/dist')));


    server.listen(userSettings.server_port, (error) => {
        logger.info(`Server started on port ${userSettings.server_port}.`)
        logger.info(`URL http://localhost:${userSettings.server_port}/`)
    })


}