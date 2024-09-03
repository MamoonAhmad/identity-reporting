#!/usr/bin/env node


import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { registerExpressEndpoints as registerTestSuiteEndpoints } from "./entities/TestSuite/endpoints.js"
import { registerExpressEndpoints as registerExecutedFunctionEndpoints, registerSocketEndpoints as registerExecutedFunctionSocketEndpoints } from './entities/ExecutedFunction/endpoints.js';
import { registerSocketEndpoints as registerTestRunSocketEndpoints } from './entities/TestRun/endpoints.js';
import { registerExpressEndpoints as registerUserSettingEndpoints } from './entities/UserSetting/endpoints.js';
import { registerEndpoints as registerClientAppEndpoints } from './clientApp.js';
import * as userSettingLoader from "./entities/UserSetting/loader.js"
import { logger } from './logger.js';
import { urlLoggerMiddleware } from './utils/server.js';





const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

/**
 * Prepares callbacks for action types on socket.io
*/
const prepareSocketListeners = (socketIOInstance) => {

    const socket = { on: () => { } }
    const testRunCallbacks = registerTestRunSocketEndpoints(socketIOInstance, socket);
    const executedFunctionCallbacks = registerExecutedFunctionSocketEndpoints(socketIOInstance, socket)

    return {
        ...testRunCallbacks,
        ...executedFunctionCallbacks,
    }
}



/**
 * Starts the server to host API on network.
 * REST API: /api/
 * WebSocket: /socket.io/
 * Static Files: Serves from the directory `frontend/dist/assets`
 * All Other Routes: Return html file from `frontend/dist/index.html`. This is done because of 
 *                   routes in React APP
 */
export async function startServer() {

    // Load user settings
    userSettingLoader.assertConfigFileExists()
    let userSettings;
    userSettings = await userSettingLoader.getSettings()

    const app = express();

    const server = http.createServer(app);

    // Socket IO
    // Served on /
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

    // Server REST API in /api
    app.use("/api", apiRouter);
    logger.debug("Registered API Routes on /api")

    // This middleware intercepts routes to forward to appropriate handlers
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


    server.listen(userSettings.server_port, () => {
        logger.info(`Server started on port ${userSettings.server_port}.`)
        logger.info(`URL http://localhost:${userSettings.server_port}/`)
    })

    server.on("error", (error) => {
        logger.error(error);
    })
}