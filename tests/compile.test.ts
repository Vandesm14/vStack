import { run, runOptions, compile } from '../lib.ts'
import { it, assertObjectMatch } from '../testlib.ts'

const compileAndRun = (code: string, opt?: runOptions) => {
	return run(compile(code), { shorten: true, ...opt })
}

const assertArrayMatch = (a: number[], b: number[]) => {
	assertObjectMatch({ value: a }, { value: b })
}

// turn a number into a uint8
const asUint = (n: number) => {
	return n & 0xff
}

it('jmp line/op', () => {
	let result = compileAndRun(`
		push 10
		push 20
		jmp +4
		push 30
		push 40
		halt
	`)
	assertArrayMatch([...result], [10, 20, 40])

	result = compileAndRun(`
		push 10
		push 20
		jmp +2
		push 30
		push 40
		halt
	`)
	assertArrayMatch([...result], [10, 20, 30, 40])
})

it.run()