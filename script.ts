import { run, compile, Op } from './lib.ts'

const program: Op[] = compile(`
	push @start
	jmp
	label:
		push 30
		push 40
		halt
	start:
		push 10
		push 20
		push @label
		jmp
		halt
`)
console.log('program:', program)

console.log('result:', run(program, { shorten: true }))