#!/usr/bin/env -S deno run --allow-all

import { compileSource } from "./compiler.ts";
import { resolve } from "./deps.ts";
import { run } from "../lib.ts";

if (Deno.args.length < 1) {
  console.error(`USAGE: ${Deno.execPath()} <INPUT>`);
  Deno.exit(1);
}

const filePath = resolve(Deno.args[0]);
console.log(filePath);

const source = await Deno.readTextFile(filePath).catch(() => {
  console.error(`error: file does not exist "${filePath}"`);
  Deno.exit(1);
});

const program = await compileSource(source);

console.log('program:', program)
console.log('result:', run(program, { shorten: true }))