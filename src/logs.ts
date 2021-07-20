import * as minehut from 'minehut-ts'
import * as serverManager from './server'
import { EventEmitter } from 'stream';

export function getLogs(server: string) {
    let event = new EventEmitter()
    let logLength = 0

    let executing = false
    setInterval(async () => {
        if (executing) return;
        executing = true
        let log = ""
        
        try {
            log = await minehut.readFile(await minehut.fetchServer(server) ,"/logs/latest.log")
        }
        catch {
            console.log("The server seems to be offline. Starting it...")
            await serverManager.startServer(server)
            process.exit(1)
        }

        if (log.length > logLength) {
            event.emit("log", log.substring(logLength))
        }
        else if (log.length < logLength) {
            console.log("Did the server restart? The log file seems to have gotten smaller!")
        }

        logLength = log.length
        executing = false
    }, 150)

    return event
}

export async function sendCommand(server: string, command: string) {
    return new Promise(async (resolve, reject) => {
        resolve(await (await minehut.fetchServer(server)).sendServerCommand(command.trim()))
    });
}