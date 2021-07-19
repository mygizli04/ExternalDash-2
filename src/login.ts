// Handle logging into minehut

import * as minehut from 'minehut-ts'
import fs from 'fs'
let puppeteer: typeof import('puppeteer') // Imported on-demand

export async function minetron(token: string): Promise<minehut.LoginInfo> {
    return await minehut.minetronLogin(token)
}

export async function har(fileLocation: string): Promise<minehut.LoginInfo> {
    return await minehut.harLogin(fs.readFileSync(fileLocation).toString())
}

export async function usernamePassword(username: string, password: string): Promise<minehut.LoginInfo> {
    return new Promise(async (resolve, reject) => {
        if (!puppeteer) {
            // Puppeteer is heavy so it's going to be optional.
            try {
                puppeteer = (await import("puppeteer")).default
            }
            catch {
                console.error("Username/Password authentication is not available if puppeteer is not available. In order to use this feature you need to run npm install.")
                process.exit(1)
            }
        }
    
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://minehut.com/login");
        await page.waitForSelector("[id='1-email']", { hidden: false });
        await page.type('[id="1-email"]', username);
        await page.type("input[name=password]", password);
        await page.waitForSelector("[name=submit]", { hidden: false });
        await page.evaluate(() => document.getElementsByName("submit")[0].click());
        page.waitForSelector(".auth0-global-message-error", { timeout: 0 }).then(() => {
            console.error("Wrong email or password");
            process.exit(1)
        });
        
        page.waitForSelector(".auth0-lock-error-invalid-hint", { timeout: 0 }).then(() => {
          console.error("Invalid email or password");
          process.exit(1)
        });
        
        page.on("requestfinished", async (request) => {
          if (request.url() === "https://authentication-service-prod.superleague.com/v1/user/login/ghost" && request.method() === "POST") {
            let response = await request.response()?.json();
            let login: minehut.LoginInfo = {
                userId: response.minehutSessionData._id,
                servers: response.minehutSessionData.servers,
                xSessionId: response.minehutSessionData.sessionId,
                authorization: response.minehutSessionData.token,
                slgSessionId: response.slgSessionData.slgSessionId,
                xSlgUser: response.slgSessionData.slgUserId
            }
            minehut._altLogin(login)
            resolve(login)
          }
        }); 
    });
}