import { run, compile, Op } from './lib.ts'

console.clear()
const PROGRAM: Op[] = compile(Deno.readTextFileSync('./program.txt'))

console.log('result:', run(PROGRAM))