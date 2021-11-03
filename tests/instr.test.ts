import { run, compile } from '../lib.ts'
// import { assertObjectMatch } from 'https://deno.land/std@0.113.0/testing/asserts.ts'
import { it, assertObjectMatch } from '../testlib.ts'
// import * as _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js'

const compileAndRun = (code: string) => {
	return run(compile(code), { shorten: true })
}

const assertArrayMatch = (a: number[], b: number[]) => {
	assertObjectMatch({ value: a }, { value: b })
}

// turn a number into a uint8
const asUint = (n: number) => {
	return n & 0xff
}

it('push', () => {
	const result = compileAndRun(`
		push 10
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('pop', () => {
	const result = compileAndRun(`
		push 10
		push 20
		pop
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('add', () => {
	const result = compileAndRun(`
		push 10
		push 20
		add
		halt
	`)
	assertArrayMatch([...result], [30])
})

it('sub', () => {
	const result = compileAndRun(`
		push 20
		push 10
		sub
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('mul', () => {
	const result = compileAndRun(`
		push 10
		push 20
		mul
		halt
	`)
	assertArrayMatch([...result], [200])
})

it('div', () => {
	const result = compileAndRun(`
		push 20
		push 10
		div
		halt
	`)
	assertArrayMatch([...result], [2])
})

it('swp', () => {
	const result = compileAndRun(`
		push 20
		push 10
		swp
		halt
	`)
	assertArrayMatch([...result], [10,20])
})

it('inc', () => {
	const result = compileAndRun(`
		push 10
		inc
		halt
	`)
	assertArrayMatch([...result], [11])
})

it('dec', () => {
	const result = compileAndRun(`
		push 10
		dec
		halt
	`)
	assertArrayMatch([...result], [9])
})

it('dup', () => {
	const result = compileAndRun(`
		push 10
		dup
		halt
	`)
	assertArrayMatch([...result], [10,10])
})

it('shl', () => {
	const result = compileAndRun(`
		push 10
		shl
		halt
	`)
	assertArrayMatch([...result], [10 << 1])
})

it('shr', () => {
	const result = compileAndRun(`
		push 10
		shr
		halt
	`)
	assertArrayMatch([...result], [10 >> 1])
})

it('and', () => {
	const result = compileAndRun(`
		push 10
		push 20
		and
		halt
	`)
	assertArrayMatch([...result], [10 & 20])
})

it('or', () => {
	const result = compileAndRun(`
		push 10
		push 20
		or
		halt
	`)
	assertArrayMatch([...result], [10 | 20])
})

it('xor', () => {
	const result = compileAndRun(`
		push 10
		push 20
		xor
		halt
	`)
	assertArrayMatch([...result], [10 ^ 20])
})

it('not', () => {
	const result = compileAndRun(`
		push 10
		not
		halt
	`)
	assertArrayMatch([...result], [asUint(~10)])
})

// TODO: Implement stkp, stki, stkd

it('jmp', () => {
	const result = compileAndRun(`
		push 10
		jmp 6
		push 20
		push 30
		halt
	`)
	assertArrayMatch([...result], [10,30])
})

it.only('jmpz', () => {
	let result = compileAndRun(`
		push 10
		push 0
		jmpz 8
		push 20
		push 30
		halt
	`)
	assertArrayMatch([...result], [10,30])

	result = compileAndRun(`
		push 10
		push 1
		jmpz 8
		push 20
		push 30
		halt
	`)
	assertArrayMatch([...result], [10,20,30])
})

it.run()