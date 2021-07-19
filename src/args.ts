interface Args {
    login?: "minehut" | "usernamepassword" | "har"
}

import argParser from "args-parser"
const args = argParser(process.argv)
const exportArgs: Args = {}

function xor(...things: any[]) {
    let or = false
    things.forEach((value, index) => {
        if (or) return;
        if (index === (things.length - 1)) return;
        or = value || things[index + 1]
    })
    if (!or) return false;
    let and = false
    things.forEach((value, index) => {
        if (and) return;
        if (index === (things.length - 1)) return;
        and = value && things[index + 1]
    })

    if (and) {
        return false
    }
    else {
        return true
    }
}

function login(type: string) {
    type = type.toLowerCase()
    if (xor(type === "minehut", type === "usernamepassword", type === "har")) {
        // @ts-expect-error
        exportArgs.login = type
    }
    else {
        debugger
        console.error("Can't parse login argument.")
    }
}

if (args.l) {
    if (typeof args.l !== "string") {
        console.error("Type of login argument is not correct. Expected string but recieved " + typeof args.l)
    }
    else {
        login(args.l)
    }
}

if (args.login) {
    if (typeof args.login !== "string") {
        console.error("Type of login argument is not correct. Expected string but recieved " + typeof args.l)
    }
    else {
        login(args.login)
    }
}

export default exportArgs