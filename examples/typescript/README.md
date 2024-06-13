# Using Typescript

This example uses an `onConfig` function and EdgeWorker written in Typescript.  The provided `onConfig` file is very minimal but provides an example of building an output format that will work with the `akj` command.

## Usage

1.  `npm install` to configure all the needed dependencies.
2.  `npm run build` to create the compiled JS files
3.  `npx akj activate -o -w ./dist  -p ./property.json` to use the compiled files with the tool.

The `akj` command is making use of a few different options in the example command:
-   `-o` to save and not activate.  This is not required when running your commands.
-   `-w` to stop property activation when there are warnings.  This is also not required when running your commands.
-   `./dist` to specify to use the directory the files are compiled to.  The tool will read the `./dist/src` file for the compiled files.
-   `-p ./property.json` will specify the file containing which property/account/etc to use that is output by an `npx akj init` command.  The `-p` argument can be avoided by having the `build` command perform a copy operation on the `package.json` into the `./dist` directory.