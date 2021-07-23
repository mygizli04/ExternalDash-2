// Handle all the server-management stuff

import * as minehut from 'minehut-ts'; // Gotta interact with minehut for obvious reasons lmao

export async function startServer (server: minehut.Server | string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        if (typeof server === "string") {
            server = await minehut.fetchServer(server);
        }

        server.start().then(() => {
            resolve();
        }).catch((err) => {
            reject(err.msg);
        });
    });
}