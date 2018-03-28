#!/usr/bin/env node

const fs        = require('fs');
const Merge     = require('lodash.merge');
const util      = require('util');
const Commander = require('commander');
const Emittery  = require('emittery');
const Exec      = require('child_process').exec;

Commander
    .option('-d, --dir [dir]', 'Find in this directory', `${process.cwd()}./src`)
    .option('-o, --out [out]', 'The output file', `${process.cwd()}/output.js`)
    .option('-b, --base [base]', 'The current lang file', `${process.cwd()}/src/lang/en.js`)
    .option('-c, --compile [compile]', 'The place where the compiled base file will be stored', `${__dirname}/compiled.js`)
    .parse(process.argv)
;

const emitter = new Emittery();

const run = (cmd) => {

    console.log(`Running: ${cmd}`);
    Exec(cmd, {
        cwd: __dirname
    }, (error, stdout, stderr) => {

        if (error) {
            console.log(error);
            console.log(stderr);
        }

        emitter.emit('created');
    });
};

const walkSync = (dir, filelist) => {

    const files = fs.readdirSync(dir);
    filelist    = filelist || [];
    files.forEach((file) => {
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            filelist = walkSync(`${dir}/${file}`, filelist);
        }
        else {
            filelist.push(`${dir}/${file}`);
        }
    });
    return filelist;
};

const createObject = (pieces) => {

    if (pieces.length === 1) {

        return { [pieces[0]] : pieces[0] };
    }

    const piece = pieces.shift();
    return { [piece] : createObject(pieces) };
};

console.log(`Compiling to: ${Commander.compile}`);

run(`npx -p babel-cli babel ${Commander.base} --presets=${__dirname}/node_modules/babel-preset-es2015 -o ${Commander.compile}`);

emitter.on('created', () => {

    const base         = require(`${Commander.compile}`).default;
    const files        = walkSync(`${Commander.dir}`);
    const translations = [];
    let jsonResult     = {};

    console.log(`Searching for translation in: ${Commander.dir}`);
    files.forEach((file) => {

        const content = fs.readFileSync(file, 'utf8');

        const regex = /\$t\('(.*)'\)/g;
        let m;

        while ((m = regex.exec(content)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            translations.push(m[1]);
        }
    });

    console.log('Parsing translations found');
    translations.forEach(translation => {

        const pieces = translation.split('.');

        Merge(jsonResult, createObject(pieces));
    });

    console.log(`Writing translations to file at: ${Commander.out}`);
    fs.writeFile(Commander.out, `export default ${util.inspect(Merge(jsonResult, base))};`, (err) => {

        if (err) {
            console.log(err);
        }
    });

    console.log(`Removing compiled file at: ${process.cwd()}/${Commander.compile}`);
    fs.unlink(Commander.compile, (err) => {

        if (err) {
            console.log(err);
        }
    });
});

