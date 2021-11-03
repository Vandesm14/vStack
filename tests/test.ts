import { run, compile } from '../lib.ts'
import { assertObjectMatch } from 'https://deno.land/std@0.113.0/testing/asserts.ts'

const compileAndRun = (code: string) => {
	return run(compile(code), { shorten: true })
}

const it = Deno.test

it('push', () => {
	const result = compileAndRun(
		'push 10\n'+
		'halt'
	)

	assertObjectMatch(result, {
		stack: [10]
	})
})