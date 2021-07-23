// Handles all questions to the user.

import inquirer from 'inquirer'; // AMAZING library for selections, how have i not known about this before?

export async function makeSelection (question: string, selections: string[]): Promise<string> {
    return (await inquirer.prompt([{
        name: "answer",
        message: question,
        type: "list",
        choices: selections
    }]) as { answer: string; }).answer;
}