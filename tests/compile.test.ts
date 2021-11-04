import { run, runOptions, compile } from '../lib.ts'
import { it, assertEquals } from '../testlib.ts'

const compileAndRun = (code: string, opt?: runOptions) => {
	return run(compile(code), { shorten: true, ...opt })
}

const asUint = (n: number) => {
	return n & 0xff
}

it('jmp line/op', async ({ step }) => {
	await step('jump to next line', () => {
		const result = compileAndRun(`
			push 10
			push 20
			jmp +2
			push 30
			push 40
			halt
		`)
		assertEquals([...result], [10, 20, 30, 40])
	})

	await step('jump past a line', () => {
		const result = compileAndRun(`
			push 10
			push 20
			jmp +4
			push 30
			push 40
			halt
		`)
		assertEquals([...result], [10, 20, 40])
	})
})

//test labels
it('label', async ({ step }) => {
	await step('label without jump', () => {
		const result = compileAndRun(`
			label:
				push 10
				push 20
			start:
				push 30
				push 40
				halt
		`)
		assertEquals([...result], [10, 20, 30, 40])
	})

	await step('label with jump (in order)', () => {
		const result = compileAndRun(`
			jmp @start
			start:
				push 10
				push 20
				jmp @label
				halt
			label:
				push 30
				push 40
				halt
		`)
		assertEquals([...result], [10, 20, 30, 40])
	})

	await step('label with jump (reversed)', () => {
		const result = compileAndRun(`
			jmp @start
			label:
				push 30
				push 40
				halt
			start:
				push 10
				push 20
				jmp @label
				halt
		`)
		assertEquals([...result], [10, 20, 30, 40])
	})
})

it.run()