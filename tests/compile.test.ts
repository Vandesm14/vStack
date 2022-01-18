import { run, runOptions, compile } from '../lib.ts'
import { it, assertEquals } from '../testlib.ts'

const compileAndRun = (code: string, opt?: runOptions) => {
	return run(compile(code), { shorten: true, ...opt })
}

it('addresses', async ({ step }) => {
	// TODO: test addresses of bounds errors

	await step('positive relative addr', () => {
		const result = compileAndRun(`
			push 10
			push @+3
			push 20
			push 30
			halt
		`)
		assertEquals([...result], [10,6,20,30])
	})

	await step('negative relative addr', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push 30
			push @-5
			halt
		`)
		assertEquals([...result], [10,20,30,2])
	})

	await step('line relative addr (ahead)', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push @4
			push 30
			halt
		`)
		assertEquals([...result], [10,20,6,30])
	})

	await step('line relative addr (behind)', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push 30
			push @3
			halt
		`)
		assertEquals([...result], [10,20,30,4])
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

it('number formats', async ({ step }) => {
	await step('0x', () => {
		const result = compileAndRun(`
			push 0x10
			halt
		`)
		assertEquals([...result], [16])
	})

	await step('0b', () => {
		const result = compileAndRun(`
			push 0b10
			halt
		`)
		assertEquals([...result], [2])
	})

	await step('0o', () => {
		const result = compileAndRun(`
			push 0o10
			halt
		`)
		assertEquals([...result], [8])
	})

	await step('character', () => {
		const result = compileAndRun(`
			push 'a'
			halt
		`)
		assertEquals([...result], [97])
	})
})

// TODO: db tests

it.run()