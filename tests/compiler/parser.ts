import 'mocha';
import { assert } from 'chai';
import Defaults from '../utility/defaults';
import Diagnostic from '../../src/diagnostic/diagnostic';
import DiagnosticCodes from '../../src/diagnostic/diagnosticCodes';
import Parser from '../../src/parser/parser';
import SyntaxCreator from '../utility/syntaxCreator';
import TokenCreator from '../utility/tokenCreator';

describe('Parser',
    function ()
    {
        let diagnostic: Diagnostic;
        let parser: Parser;

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic();

                parser = new Parser(diagnostic);
            }
        );

        it('can parse an empty file.',
            function ()
            {
                const expectedResult = SyntaxCreator.newFile();

                const result = parser.run([], Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration()
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function declaration with a parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            undefined,
                            SyntaxCreator.newFunctionParametersList(
                                [
                                    SyntaxCreator.newFunctionParameter()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a call statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newFunctionCall()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a call statement with an argument.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newFunctionCall(
                                        SyntaxCreator.newCallArgumentsList(
                                            [
                                                SyntaxCreator.newIntegerLiteral()
                                            ]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newVariableDeclaration(
                                        undefined,
                                        SyntaxCreator.newTypeClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable assignment.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an empty array literal.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newOpeningSquareBracket(),
                    TokenCreator.newClosingSquareBracket(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newArrayLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an array literal with one element.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newOpeningSquareBracket(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingSquareBracket(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newArrayLiteral(
                                            SyntaxCreator.newArrayElementsList(
                                                [
                                                    SyntaxCreator.newIntegerLiteral()
                                                ]
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an array literal with multiple elements.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newOpeningSquareBracket(),
                    TokenCreator.newInteger(),
                    TokenCreator.newComma(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingSquareBracket(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newArrayLiteral(
                                            SyntaxCreator.newArrayElementsList(
                                                [
                                                    SyntaxCreator.newIntegerLiteral(),
                                                    SyntaxCreator.newIntegerLiteral()
                                                ]
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an integer addition.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerAddition()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a less operator.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newLess(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newIntegerLiteral(),
                                            TokenCreator.newLess(),
                                            SyntaxCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a greater operator.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newGreater(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newIntegerLiteral(),
                                            TokenCreator.newGreater(),
                                            SyntaxCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a parenthesized expression.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newAddition(
                                            SyntaxCreator.newIntegerLiteral(),
                                            SyntaxCreator.newParenthesizedExpression(
                                                SyntaxCreator.newIntegerAddition()
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an empty return statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function returning a value.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            ),
                            undefined,
                            SyntaxCreator.newTypeClause()
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an algebraic sign.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newMinus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerNegation()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable expression.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newFunctionCall(
                                        SyntaxCreator.newCallArgumentsList(
                                            [
                                                SyntaxCreator.newVariableExpression()
                                            ]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an if statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an else statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newFalseKeyword(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                    TokenCreator.newElseKeyword(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement(
                                        SyntaxCreator.newFalseBooleanLiteral(),
                                        undefined,
                                        SyntaxCreator.newElseClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an if else if statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newFalseKeyword(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                    TokenCreator.newElseKeyword(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement(
                                        SyntaxCreator.newFalseBooleanLiteral(),
                                        undefined,
                                        SyntaxCreator.newElseClause(
                                            SyntaxCreator.newIfStatement()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a while statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newWhileKeyword(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newWhileStatement()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a import statement.',
            function ()
            {
                const input = [
                    TokenCreator.newImportKeyword(),
                    TokenCreator.newString(Defaults.importFileName),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn()
                                ]
                            )
                        )
                    ],
                    [
                        SyntaxCreator.newImport()
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception if there is no semicolon after a statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newClosingBrace(),
                ];

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    DiagnosticCodes.MissingSemicolonAfterStatementError
                );
            }
        );

        it('throws an exception if there is something else than an identifier in a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    DiagnosticCodes.UnexpectedTokenAfterVariableDeclarationIdentifierError
                );
            }
        );

        it('throws an exception if a variable declaration has no type clause.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    DiagnosticCodes.UnexpectedTokenAfterVariableDeclarationIdentifierError
                );
            }
        );
    }
);
