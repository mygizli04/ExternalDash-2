// Main file (wow)

import getArgs from "./src/args";
import * as login from './src/login'
import readlineSync from 'readline-sync'
import {LoginInfo, fetchServers} from 'minehut-ts'
import * as server from './src/server'
import * as selection from './src/selection'
import * as logs from './src/logs'

let args = getArgs([
    {
        name: "login",
        aliases: ["l"],
        default: "minetron",
        values: ["minetron", "har", "usernamepassword"]
    },
    {
        name: "minetrontoken",
        aliases: ["token", "t"],
        validator: value => value.length === 36,
        validationError: "Minehut tokens must be 36 characters in length.",
        requiredValues: {
            login: "minetron"
        }
    },
    {
        name: "username",
        aliases: ["u", "user"],
        requiredValues: {
            login: "usernamepassword"
        }
    },
    {
        name: "password",
        aliases: ["p", "password"],
        requiredValues: {
            login: "usernamepassword"
        }
    },
    {
        name: "harfile",
        aliases: ["h", "file", "har"],
        requiredValues: {
            login: "har"
        }
    },
    {
        name: "server",
        aliases: ["s"]
    },
    {
        name: "start",
        aliases: [],
        bool: true
    },
    {
        name: "menu",
        aliases: ["m"],
        bool: true
    },
    {
        name: "log",
        aliases: [],
        bool: true
    }
]) as {
    login: "minetron" | "har" | "usernamepassword",
    minetrontoken?: string,
    username?: string,
    password?: string,
    harfile?: string,
    server?: string,
    start?: boolean,
    menu?: boolean
}

const commands: {
    name: string,
    description: string,
    function: Function
}[] = [
    {
        name: "start",
        function: startServer,
        description: "Start server"
    },
    {
        name: "log",
        function: watchLogs,
        description: "See server logs"
    }
]

let loginInfo: LoginInfo;

(async () => {
    switch (args.login) {
        case "minetron":
            const token = args.minetrontoken ?? readlineSync.question("What is your minetron token? ")
            
            loginInfo = await login.minetron(token)
        break
        case "usernamepassword":
            const username = args.username ?? readlineSync.question("What is your minehut username? ")
            const password = args.password ?? readlineSync.question("What is your password? ", {
                hideEchoBack: true
            })
    
            loginInfo = await login.usernamePassword(username, password)
        break
        case "har":
            const har = args.harfile ?? readlineSync.question("Where is the HAR file you want to use? ")
    
            loginInfo = await login.har(har)
        break
    }

    console.log("Login success!")

    if (!args.server) {
        let servers: string[] = [];
        (await fetchServers()).forEach(server => servers.push(server.name))
        args.server = await selection.makeSelection("Which server would you like to work on?", servers)
    }

    let action = false
    commands.forEach((value) => {
        // @ts-expect-error | Honestly i have no clue how to fix this without sacrificing any sort of typing
        if (args[value.name]) {
            action = true
            value.function()
        }
    })

    if (!action || args.menu) {
        let answer = await selection.makeSelection("Welcome! What would you like to do?", commands.map(value => value.description))
        commands.forEach(command => {
            if (command.description === answer) {
                command.function()
            }
        })
    }
})();

function startServer() {
    console.log("Starting server...")
    server.startServer(args.server!).then(() => {
        console.log("Successfully started server!")
    }).catch((err) => {
        console.log("Failed to start the server.\n\n" + err)
    })
}

function watchLogs() {
    let log = logs.getLogs(args.server!)
    log.on("log", (log: string) => {
        process.stdout.write(log)
    })
}