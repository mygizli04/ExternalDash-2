declare module "args-parser" {
    export default function Parse(argv: string[]): {[key: string]: string | boolean | number}
}