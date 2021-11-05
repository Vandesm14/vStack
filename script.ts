import { run, compile, Op } from './lib.ts'

const program: Op[] = compile(`
	push 1  ; (accumulator)
	push 0  ; a, (index)
	inc     ; a, (i++)
	dup		  ; a, i, (i)
	rot     ; (i), i, (a)
	add     ; i, (i + a)
	dup     ; i, a, a
	rot 	  ; (a), a, (i)
	pop     ; a, a, [i]
	dup2 	  ; a, a, (i = a)
	push 50 ; a, i, i, (10)
	push @3 ; a, i, i, 10, (@2)
	jmpl    ; a, i, (i < 10 jmp @2)
	pop     ; ...a, i, [@3]
	pop     ; ...a, [i]
	halt
`)
console.log('program:', program)
console.log('result:', run(program, { shorten: true, debug: true }))