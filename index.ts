// Main file (wow)

import getArgs from "./src/args";
import * as login from './src/login'
import readlineSync from 'readline-sync'
import {LoginInfo, fetchServers} from 'minehut-ts'
import * as server from './src/server'
import * as selection from './src/selection'

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
    }
]) as {
    login: "minetron" | "har" | "usernamepassword",
    minetrontoken?: string,
    username?: string,
    password?: string,
    harfile?: string,
    server?: string,
    start?: boolean
}

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

    if (args.start) {
        console.log("Starting server...")
        server.startServer(args.server!).then(() => {
            console.log("Successfully started server!")
        }).catch((err) => {
            console.log("Failed to start the server.\n\n" + err)
        })
    }
})();