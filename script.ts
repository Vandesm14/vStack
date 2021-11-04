import { run, compile, Op } from './lib.ts'

const program: Op[] = compile(`
	push 10
	push 20
	push @+2
	jmp
	push 30
	push 40
	halt
`)
console.log('program:', program)

console.log('result:', run(program, { shorten: true }))