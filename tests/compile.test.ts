import { run, runOptions, compile } from '../lib.ts'
import { it, assertEquals } from '../testlib.ts'

const compileAndRun = (code: string, opt?: runOptions) => {
	return run(compile(code), { shorten: true, ...opt })
}

it('relative jump', async ({ step }) => {
	await step('jump to next line', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push @+2
			jmp
			push 30
			push 40
			halt
		`)
		assertEquals([...result], [10,20,30,40])
	})

	await step('jump past a line', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push @+4
			jmp
			push 30
			push 40
			halt
		`)
		assertEquals([...result], [10,20,40])
	})
})

//test labels
it('labels', async ({ step }) => {
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
		assertEquals([...result], [10,20,30,40])
	})

	await step('label with jump (in order)', () => {
		const result = compileAndRun(`
			push @start
			jmp
			start:
				push 10
				push 20
				push @label
				jmp
				halt
			label:
				push 30
				push 40
				halt
		`)
		assertEquals([...result], [10,20,30,40])
	})

	await step('label with jump (reversed)', () => {
		const result = compileAndRun(`
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
		assertEquals([...result], [10,20,30,40])
	})
})

it('spr (relative stack pointer)', async ({ step }) => {
	await step('sp +1', () => {
		const result = compileAndRun(`
			push 10
			push 20
			spr +1
			halt
		`)
		assertEquals([...result], [10,20,0])
	})

	await step('sp +2', () => {
		const result = compileAndRun(`
			push 10
			push 20
			spr +2
			halt
		`)
		assertEquals([...result], [10,20,0,0])
	})

	await step('sp -1', () => {
		const result = compileAndRun(`
			push 10
			push 20
			spr -1
			halt
		`)
		assertEquals([...result], [10])
	})

	await step('sp -2', () => {
		const result = compileAndRun(`
			push 10
			push 20
			spr -2
			halt
		`)
		assertEquals([...result], [])
	})
})

it.run()