// Parse and check arguments.

//TODO: Improve variable names

interface Argument {
    name: string,
    aliases: string[],
    default?: string,
    values?: string[],
    validator?: (value: string) => boolean,
    validationError?: string,
    requiredValues?: {
        [key: string]: string | null;
    },
    bool?: boolean;
}

export default function getArgs (args: Argument[]) {
    let ret: {
        [key: string]: any;
    } = {};
    args.forEach((arg) => {
        process.argv.forEach((value, index) => {
            if (argMatch(arg, value)) {
                if (arg.values) {
                    let match = false;
                    arg.values.forEach(matcher => {
                        if (matcher === process.argv[index + 1]) match = true;
                    });

                    if (!match) {
                        console.error("Invalid value provided for " + arg.name + ". Possible values are: " + arg.values.join(", ") + ".");
                        process.exit(1);
                    }
                }

                if (arg.validator && !arg.validator(process.argv[index + 1])) {
                    if (arg.validationError) {
                        console.error(arg.validationError);
                        process.exit(1);
                    }
                    else {
                        console.error("Validation failed for argument " + arg.name + ".");
                        process.exit(1);
                    }
                }

                ret[arg.name] = process.argv[index + 1];
            }
        });

        if (!ret[arg.name] && arg.default) {
            ret[arg.name] = arg.default;
        }
    });

    args.forEach(arg => {
        if (!ret.hasOwnProperty(arg.name)) return;
        if (arg.requiredValues) {
            objectForEach(arg.requiredValues, (value, index) => {
                if (!value && !ret[index]) {
                    console.error("Cannot use argument " + arg.name + " without specifying " + index + ".");
                    process.exit(1);
                }
                else if (value && (ret[index] !== value)) {
                    console.error("Cannot use the argument " + arg.name + " if the " + index + " argument is not " + value);
                    process.exit(1);
                }
            });
        }
        if (arg.bool) {
            ret[arg.name] = true;
        }
    });

    return ret;
}

function objectForEach (object: Object, callback: (value: string | null, index: string, object: Object) => any) {
    Object.entries(object).forEach(entry => {
        callback(entry[1], entry[0], object);
    });
}

function argMatch (arg: Argument, match: string) {
    if (match === ("--" + arg.name)) {
        return true;
    }

    let ret = false;
    arg.aliases.forEach((value) => {
        if (ret) return;
        if (match === "-" + value) ret = true;
    });
    return ret;
}