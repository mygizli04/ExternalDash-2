import getArgs from "./src/args";
import * as login from './src/login'
import readlineSync from 'readline-sync'

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
    }
]) as {
    login: "minetron" | "har" | "usernamepassword",
    minetrontoken?: string,
    username?: string,
    password?: string,
    harfile?: string
}

let loginInfo;

switch (args.login) {
    case "minetron":
        const token = args.minetrontoken ?? readlineSync.question("What is your minetron token? ")
        
        loginInfo = login.minetron(token)
    break
    case "usernamepassword":
        const username = args.username ?? readlineSync.question("What is your minehut username? ")
        const password = args.password ?? readlineSync.question("What is your password? ", {
            hideEchoBack: true
        })

        loginInfo = login.usernamePassword(username, password)
    break
    case "har":
        const har = args.harfile ?? readlineSync.question("Where is the HAR file you want to use? ")

        loginInfo = login.har(args.harfile!)
    break
}