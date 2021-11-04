import { run, compile, Op } from './lib.ts'

const program: Op[] = compile(`
	push 4
	push 2
	sub
	halt
`)
console.log('program:', program)

console.log('result:', run(program, { shorten: true }))