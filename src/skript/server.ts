import * as minehut from "minehut-ts";
import * as selection from "../selection";

class Skript {
    name: string;
    disabled: boolean;
    server: minehut.Server;
    file: minehut.FileInfo;
    delete () {
        deleteSkript(this);
    }

    constructor (options: {
        name: string,
        server: minehut.Server,
        file: minehut.FileInfo;
    }) {
        if (options.name.startsWith("-")) {
            this.name = options.name.substring(1);
            this.disabled = true;
        }
        else {
            this.name = options.name;
            this.disabled = false;
        }
        this.name = this.name.replace(".sk", "");
        this.server = options.server;
        this.file = options.file;
    }
}

export async function listSkripts (server: string): Promise<Skript[]> {
    let serverObj = await minehut.fetchServer(server);
    if (!(serverObj.serviceOnline)) {
        console.error("Server is not online.");
        await serverObj.start();
    }
    return new Promise(async (resolve, reject) => {
        resolve((await minehut.listDir(serverObj, "/plugins/Skript/scripts")).map(value => new Skript({ name: value.name, server: value.server, file: value })).filter(skript => skript.name !== "- Files prefixed with a hyphen are disabled! --"));
    });
}

export async function askDeleteSkript (server: string) {
    let skripts = await listSkripts(server);
    let choice = await selection.makeSelection("Which Skript would you like to delete?", skripts.map(skript => skript.name));
    deleteSkript(skripts.filter(skriptz => skriptz.name === choice)[0]);
}

export async function deleteSkript (skript: Skript): Promise<void> {
    return new Promise((resolve, reject) => {
        skript.file.delete().then(() => resolve());
    });
}

export async function askDisableSkript (server: string): Promise<void> {
    let skripts = (await listSkripts(server)).filter(skript => !skript.disabled);
    if (skripts.length === 0) {
        console.error("You have no skripts to disable!");
        process.exit(1);
    }
    let choice = await selection.makeSelection("Which Skript would you like to disable?", skripts.map(skript => skript.name));
    disableSkript(skripts.filter(skript => skript.name === choice)[0]);
}

async function rename (file: minehut.FileInfo, newpath: string): Promise<minehut.FileInfo> {
    let contents = await file.fetch() as string;
    await file.delete();
    return Promise.resolve(await file.server.createFile(newpath, contents));
}

export async function disableSkript (skript: Skript) {
    if (skript.server.online) {
        skript.server.sendServerCommand("skript disable " + skript.name + ".sk");
        return Promise.resolve();
    }
    await rename(skript.file, skript.file.path + "/-" + skript.file.name);
    return Promise.resolve();
}

export async function askEnableSkript (server: string) {
    let skripts = (await listSkripts(server)).filter(skript => skript.disabled);
    if (skripts.length === 0) {
        console.error("You have no skripts to enable!");
        process.exit(1);
    }
    let choice = await selection.makeSelection("Which Skript would you like to enable?", skripts.map(skript => skript.name));
    enableSkript(skripts.filter(skript => skript.name === choice)[0]);
}

export async function enableSkript (skript: Skript): Promise<void> {
    if (skript.server.online) {
        skript.server.sendServerCommand("skript enable " + skript.name + ".sk");
        return Promise.resolve();
    }
    await rename(skript.file, skript.file.path + "/" + skript.file.name.substring(1));
    return Promise.resolve();
}
