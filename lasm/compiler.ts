import {
  KwTokenKind,
  LitTokenKind,
  SymTokenKind,
  Token,
  TokenKind,
  lex,
} from "./lexer.ts";
import { Op } from "../lib.ts";
import { StringReader } from "./deps.ts";

/** A token compiler implementation. */
export type TokenImpl = (token: Token) => [Op, number] | [Op];

/** Compiles tokens into instructions. */
export async function* compile(
  tokens: AsyncIterableIterator<Token>,
): AsyncIterableIterator<[Op, number] | [Op]> {
  for await (const token of tokens) {
    yield COMPILES[token.kind](token);
  }
}

/** Simple compile for shane ¯\_(ツ)_/¯. */
export async function compileSource(source: string): Promise<number[]> {
  const program: number[] = [];
  for await (const inst of compile(lex(new StringReader(source)))) {
    program.push(...inst);
  }
  return program;
}

/** The token compilation implementations. */
const COMPILES: Record<TokenKind, TokenImpl> = {
  // @ts-expect-error value must exist for number tokens
  [LitTokenKind.Number]: (tok: Token): [Op, number] => [Op.Push, tok.value as number],

	[KwTokenKind.Nop]: (): [Op] => [Op.Nop],
	[KwTokenKind.Pop]: (): [Op] => [Op.Pop],

	[KwTokenKind.Sp]: (): [Op] => [Op.Sp],
	[KwTokenKind.Spi]: (): [Op] => [Op.Spi],
	[KwTokenKind.Spd]: (): [Op] => [Op.Spd],
	[KwTokenKind.Swp]: (): [Op] => [Op.Swp],
	[KwTokenKind.Dup]: (): [Op] => [Op.Dup],
	[KwTokenKind.Dup2]: (): [Op] => [Op.Dup2],
	[KwTokenKind.Over]: (): [Op] => [Op.Over],
	[KwTokenKind.Rot]: (): [Op] => [Op.Rot],

	[KwTokenKind.Proc]: (): [Op] => [Op.Proc],
	[KwTokenKind.Ret]: (): [Op] => [Op.Ret],

	[KwTokenKind.Db]: (): [Op] => [Op.Db],

	[KwTokenKind.Jmp]: (): [Op] => [Op.Jmp],
	[KwTokenKind.Jmpz]: (): [Op] => [Op.Jmpz],
	[KwTokenKind.Jmpnz]: (): [Op] => [Op.Jmpnz],
	[KwTokenKind.Jmpe]: (): [Op] => [Op.Jmpe],
	[KwTokenKind.Jmpne]: (): [Op] => [Op.Jmpne],
	[KwTokenKind.Jmpg]: (): [Op] => [Op.Jmpg],
	[KwTokenKind.Jmpge]: (): [Op] => [Op.Jmpge],
	[KwTokenKind.Jmpl]: (): [Op] => [Op.Jmpl],
	[KwTokenKind.Jmple]: (): [Op] => [Op.Jmple],

	[KwTokenKind.Read]: (): [Op] => [Op.Read],
	[KwTokenKind.Write]: (): [Op] => [Op.Write],
	[KwTokenKind.Halt]: (): [Op] => [Op.Halt],
	[KwTokenKind.DEBUG]: (): [Op] => [Op.DEBUG],

	[SymTokenKind.Add]: (): [Op] => [Op.Add],
	[SymTokenKind.Sub]: (): [Op] => [Op.Sub],
	[SymTokenKind.Mul]: (): [Op] => [Op.Mul],
	[SymTokenKind.Div]: (): [Op] => [Op.Div],
	[SymTokenKind.Inc]: (): [Op] => [Op.Inc],
	[SymTokenKind.Dec]: (): [Op] => [Op.Dec],
	[SymTokenKind.Shl]: (): [Op] => [Op.Shl],
	[SymTokenKind.Shr]: (): [Op] => [Op.Shr],

	[SymTokenKind.And]: (): [Op] => [Op.And],
	[SymTokenKind.Or]: (): [Op] => [Op.Or],
	[SymTokenKind.Xor]: (): [Op] => [Op.Xor],
	[SymTokenKind.Not]: (): [Op] => [Op.Not],
};
