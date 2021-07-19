import inquirer from 'inquirer'

export async function makeSelection(question: string, selections: string[]): Promise<string> {
    return (await inquirer.prompt([{
        name: "answer",
        message: question,
        type: "list",
        choices: selections
    }]) as {answer: string}).answer
}