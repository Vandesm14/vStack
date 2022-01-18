import { run, runOptions, compile } from '../lib.ts'
import { it, assertEquals } from '../testlib.ts'

const compileAndRun = (code: string, opt?: runOptions) => {
	return run(compile(code), { shorten: true, ...opt })
}

it('loop', () => {
	const result = compileAndRun(`
		push 0  ; index (i)
		inc     ; i++
		dup     ; i, i
		push 10 ; operand for cmp
		push @2 ; addr to jump to
		jmpl    ; jmp if i < 10
		halt
	`)
	assertEquals([...result], [10])
})

it.skip('fib', () => {
	const result = compileAndRun(`
		push 0  ; index (i) ; 0
		inc     ; i++
		dup     ; i, i
		push 10 ; operand for cmp
		push @2 ; addr to jump to
		jmpl    ; jmp if i < 10
		halt
	`)
	assertEquals([...result], [1, 1, 2, 3, 5, 8, 13, 21, 34, 55])
})

it.run()