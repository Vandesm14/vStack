interface Test {
	name: string
	fn: DenoTestFn
	only?: boolean
	skip?: boolean
}

type DenoTestFn = (t: { step: TestFn }) => void | Promise<void>
type TestFn = (name: string, fn: DenoTestFn) => void

const tests: Test[] = []

interface it {
	(): TestFn
	only: TestFn
	skip: TestFn
	run: () => void
}

export function it(name: string, fn: DenoTestFn) {
	tests.push({ name, fn })
	// @ts-expect-error: no idea, doesn't work without this
	return this
}

it.only = function(name: string, fn: DenoTestFn) {
	tests.push({ name, fn, only: true })
	return this
}

it.skip = function(name: string, fn: DenoTestFn) {
	tests.push({ name, fn, skip: true })
	return this
}

it.run = function() {
	let arr = tests.filter(el => !el.skip)
	if (arr.some(el => el.only)) arr = arr.filter(el => el.only)
	for (const test of arr) {
		Deno.test(test.name, test.fn)
	}
}

export const test = it
export * from 'https://deno.land/std@0.113.0/testing/asserts.ts'