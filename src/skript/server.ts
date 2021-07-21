import * as minehut from "minehut-ts";
import * as selection from "../selection"

class Skript {
    name: string
    disabled: boolean
    server: minehut.Server
    delete() {
        deleteSkript(this)
    }

    constructor(options: {
        name: string,
        server: minehut.Server
    }) {
        if (options.name.startsWith("-")) {
            this.name = options.name.substring(1)
            this.disabled = true
        }
        else {
            this.name = options.name
            this.disabled = false
        }
        this.name = this.name.replace(".sk", "")
        this.server = options.server
    }
}

export async function listSkripts(server: string): Promise<Skript[]> {
    let serverObj = await minehut.fetchServer(server)
    if (!(serverObj.serviceOnline)) {
        console.error("Server is not online.")
        await serverObj.start()
    }
    return new Promise(async (resolve, reject) => {
        resolve((await minehut.listDir(serverObj, "/plugins/Skript/scripts")).map(value => new Skript({name: value.name, server: value.server})).filter(skript => skript.name !== "- Files prefixed with a hyphen are disabled! --"))
    });
}

export async function askDeleteSkript(server: string) {
    let skripts = await listSkripts(server)
    let choice = await selection.makeSelection("Which Skript would you like to delete?", skripts.map(skript => skript.name))
    deleteSkript(skripts.filter(skriptz => skriptz.name === choice)[0])
}

async function deleteSkript(skript: Skript) {
    debugger
}