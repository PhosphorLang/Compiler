import * as SyntaxNodes from "./syntaxNodes";
import CallArgumentsList from "./lists/callArgumentsList";
import Diagnostic from "../diagnostic/diagnostic";
import DiagnosticCodes from "../diagnostic/diagnosticCodes";
import DiagnosticError from "../diagnostic/diagnosticError";
import FunctionParametersList from "./lists/functionParametersList";
import OperatorOrder from "./operatorOrder";
import { SyntaxNode } from "./syntaxNodes";
import Token from "../lexer/token";
import TokenKind from "../lexer/tokenKind";
import ArrayElementsList from "./lists/arrayElementsList";

export default class Parser
{
    private readonly diagnostic: Diagnostic;

    private fileName: string;
    private tokens: Token[];
    private position: number;

    constructor (diagnostic: Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.fileName = '';
        this.tokens = [];
        this.position = 0;
    }

    private getToken (relativePosition: number, increasePosition: boolean): Token
    {
        const index = this.position + relativePosition;
        let result: Token;

        if ((index < this.tokens.length) && (index >= 0))
        {
            result = this.tokens[index];
        }
        else
        {
            result = new Token(TokenKind.NoToken, '');
        }

        if (increasePosition)
        {
            this.position++;
        }

        return result;
    }

    private consumeNextToken (): Token
    {
        return this.getToken(0, true);
    }

    private getCurrentToken (): Token
    {
        return this.getToken(0, false);
    }

    private getFollowerToken (): Token
    {
        return this.getToken(1, false);
    }

    private getPreviousToken (): Token
    {
        return this.getToken(-1, false);
    }

    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @param fileName The name/path of the file
     * @return The root of the parsed syntax tree.
     */
    public run (tokens: Token[], fileName: string): SyntaxNodes.File
    {
        this.tokens = tokens;
        this.fileName = fileName;
        this.position = 0;

        const root = this.parseFile();

        return root;
    }

    private parseFile (): SyntaxNodes.File
    {
        const imports: SyntaxNodes.Import[] = [];
        const functions: SyntaxNodes.FunctionDeclaration[] = [];

        while (this.getCurrentToken().kind != TokenKind.NoToken)
        {
            switch (this.getCurrentToken().kind)
            {
                case TokenKind.ImportKeyword:
                {
                    const importDeclaration = this.parseImport();
                    imports.push(importDeclaration);
                    break;
                }
                case TokenKind.FunctionKeyword:
                {
                    const functionDeclaration = this.parseFunctionDeclaration(false);
                    functions.push(functionDeclaration);
                    break;
                }
                case TokenKind.ExternalKeyword:
                {
                    const functionDeclaration = this.parseFunctionModifier();
                    functions.push(functionDeclaration);
                    break;
                }
                default:
                    this.diagnostic.throw(
                        new DiagnosticError(
                            `The token "${this.getCurrentToken().content}" is not allowed in the file scope.`,
                            DiagnosticCodes.InvalidTokenInFileScopeError,
                            this.getCurrentToken()
                        )
                    );
            }
        }

        const fileRoot = new SyntaxNodes.File(this.fileName, imports, functions);

        return fileRoot;
    }

    private parseImport (): SyntaxNodes.Import
    {
        const keyword = this.consumeNextToken();
        const path = this.consumeNextToken();
        // The semicolon:
        this.consumeNextToken();

        return new SyntaxNodes.Import(keyword, path);
    }

    private parseFunctionModifier (modifiers: Token[] = []): SyntaxNodes.FunctionDeclaration
    {
        let functionDeclaration: SyntaxNodes.FunctionDeclaration;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.ExternalKeyword:
            {
                const newModifier = this.consumeNextToken();
                modifiers.push(newModifier);

                functionDeclaration = this.parseFunctionModifier(modifiers);

                break;
            }
            case TokenKind.FunctionKeyword:
            {
                let isExternal = false;

                for (const modifier of modifiers)
                {
                    switch (modifier.kind)
                    {
                        case TokenKind.ExternalKeyword:
                            isExternal = true;
                            break;
                        default:
                            break;
                    }
                }

                functionDeclaration = this.parseFunctionDeclaration(isExternal);

                break;
            }
            default:
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Unknown function modifier "${this.getCurrentToken().content}"`,
                        DiagnosticCodes.UnknownFunctionModifierError,
                        this.getCurrentToken()
                    )
                );
        }

        return functionDeclaration;
    }

    private parseFunctionDeclaration (isExternal: boolean): SyntaxNodes.FunctionDeclaration
    {
        const keyword = this.consumeNextToken();
        const identifier = this.consumeNextToken();
        const opening = this.consumeNextToken();
        const parameters = this.parseFunctionParameters();
        const closing = this.consumeNextToken();
        const type = this.parseTypeClause();
        const body = this.parseSection();

        if (isExternal)
        {
            // The semicolon:
            this.consumeNextToken();
        }

        return new SyntaxNodes.FunctionDeclaration(keyword, identifier, opening, parameters, closing, type, body, isExternal);
    }

    private parseFunctionParameters (): FunctionParametersList
    {
        const parameters: SyntaxNodes.FunctionParameter[] = [];
        const separators: Token[] = [];

        while ((this.getCurrentToken().kind != TokenKind.ClosingParenthesisToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const parameter = this.parseFunctionParameter();
            parameters.push(parameter);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
            else
            {
                break;
            }
        }

        return new FunctionParametersList(parameters, separators);
    }

    private parseFunctionParameter (): SyntaxNodes.FunctionParameter
    {
        const identifier = this.consumeNextToken();
        const type = this.parseTypeClause();

        if (type === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Missing type clause in parameter definition`,
                    DiagnosticCodes.MissingTypeClauseInParameterDefinitionError,
                    identifier
                )
            );
        }

        return new SyntaxNodes.FunctionParameter(identifier, type);
    }

    private parseTypeClause (): SyntaxNodes.TypeClause|null
    {
        if (this.getCurrentToken().kind != TokenKind.ColonToken)
        {
            return null;
        }
        else
        {
            const colon = this.consumeNextToken();
            const identifier = this.consumeNextToken();

            return new SyntaxNodes.TypeClause(colon, identifier);
        }
    }

    private parseSection (): SyntaxNodes.Section|null
    {
        if (this.getCurrentToken().kind != TokenKind.OpeningBraceToken)
        {
            return null;
        }

        const opening = this.consumeNextToken();

        const statements: SyntaxNode[] = [];

        while ((this.getCurrentToken().kind != TokenKind.ClosingBraceToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const statement = this.parseStatement();
            statements.push(statement);

            // TODO: Prevent an infinite loop when there is a syntax error.
        }

        const closing = this.consumeNextToken();

        return new SyntaxNodes.Section(opening, statements, closing);
    }

    private parseStatement (): SyntaxNode
    {
        let result: SyntaxNode;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.VarKeyword:
                result = this.parseVariableDeclaration();
                break;
            case TokenKind.ReturnKeyword:
                result = this.parseReturnStatement();
                break;
            case TokenKind.IfKeyword:
                result = this.parseIfStatement();
                break;
            case TokenKind.WhileKeyword:
                result = this.parseWhileStatement();
                break;
            default:
            {
                if (this.isAssignment())
                {
                    result = this.parseAssignment();
                }
                else
                {
                    result = this.parseExpression();
                }
            }
        }

        if (this.getCurrentToken().kind == TokenKind.SemicolonToken)
        {
            // Remove the correct token:
            this.consumeNextToken();
        }
        else if (this.getPreviousToken().kind != TokenKind.ClosingBraceToken) // No semicolon needed after a closing brace (often a section).
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Missing semicolon after statement`,
                    DiagnosticCodes.MissingSemicolonAfterStatementError,
                    this.getCurrentToken()
                )
            );
        }

        return result;
    }

    private parseReturnStatement (): SyntaxNodes.ReturnStatement
    {
        const keyword = this.consumeNextToken();

        let expression: SyntaxNodes.Expression|null = null;

        if (this.getCurrentToken().kind != TokenKind.SemicolonToken)
        {
            expression = this.parseExpression();
        }

        return new SyntaxNodes.ReturnStatement(keyword, expression);
    }

    private parseVariableDeclaration (): SyntaxNodes.VariableDeclaration
    {
        const keyword = this.consumeNextToken();
        const identifier = this.consumeNextToken();
        let type: SyntaxNodes.TypeClause|null = null;
        let assignment: Token|null = null;
        let initialiser: SyntaxNodes.Expression|null = null;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.AssignmentOperator:
                assignment = this.consumeNextToken();
                initialiser = this.parseExpression();
                break;
            case TokenKind.ColonToken:
                type = this.parseTypeClause();
                break;
            default:
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Unexpected token "${this.getFollowerToken().content}" after variable declaration identifier`,
                        DiagnosticCodes.UnexpectedTokenAfterVariableDeclarationIdentifierError,
                        this.getCurrentToken()
                    )
                );
        }

        return new SyntaxNodes.VariableDeclaration(keyword, identifier, type, assignment, initialiser);
    }

    private parseIfStatement (): SyntaxNodes.IfStatement
    {
        const keyword = this.consumeNextToken();
        const condition = this.parseExpression();
        const section = this.parseSection();

        if (section === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    'Missing section in if statement.',
                    DiagnosticCodes.MissingSectionInIfStatementError,
                    keyword
                )
            );
        }

        let elseClause: SyntaxNodes.ElseClause|null = null;

        if (this.getCurrentToken().kind == TokenKind.ElseKeyword)
        {
            elseClause = this.parseElseClause();
        }

        return new SyntaxNodes.IfStatement(keyword, condition, section, elseClause);
    }

    private parseElseClause (): SyntaxNodes.ElseClause
    {
        const keyword = this.consumeNextToken();
        let followUp: SyntaxNodes.Section | SyntaxNodes.IfStatement;

        if (this.getCurrentToken().kind == TokenKind.IfKeyword)
        {
            followUp = this.parseIfStatement();
        }
        else
        {
            const section = this.parseSection();

            if (section === null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        'Missing section in else clause.',
                        DiagnosticCodes.MissingSectionInElseClauseError,
                        keyword
                    )
                );
            }

            followUp = section;
        }

        return new SyntaxNodes.ElseClause(keyword, followUp);
    }

    private parseWhileStatement (): SyntaxNodes.WhileStatement
    {
        const keyword = this.consumeNextToken();
        const condition = this.parseExpression();
        const section = this.parseSection();

        if (section === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    'Missing section in while statement.',
                    DiagnosticCodes.MissingSectionInWhileStatementError,
                    keyword
                )
            );
        }

        return new SyntaxNodes.WhileStatement(keyword, condition, section);
    }

    private isAssignment (): boolean
    {
        const result = (this.getCurrentToken().kind == TokenKind.IdentifierToken) && (this.getFollowerToken().kind == TokenKind.AssignmentOperator);

        return result;
    }

    private parseAssignment (): SyntaxNodes.Assignment
    {
        const identifierToken = this.consumeNextToken();
        const operatorToken = this.consumeNextToken();
        const rightSide = this.parseExpression();

        const result = new SyntaxNodes.Assignment(identifierToken, operatorToken, rightSide);

        return result;
    }

    private parseExpression (parentPriority = 0): SyntaxNodes.Expression
    {
        let left;

        if (this.isUnaryExpression(parentPriority))
        {
            left = this.parseUnaryExpression();
        }
        else
        {
            left = this.parsePrimaryExpression();
        }

        while (this.isBinaryExpression(parentPriority))
        {
            left = this.parseBinaryExpression(left);
        }

        return left;
    }

    private isUnaryExpression (parentPriority: number): boolean
    {
        const unaryPriority = OperatorOrder.getUnaryPriority(this.getCurrentToken());

        const result = (unaryPriority !== 0) && (unaryPriority >= parentPriority);

        return result;
    }

    private isBinaryExpression (parentPriority: number): boolean
    {
        const binaryPriority = OperatorOrder.getBinaryPriority(this.getCurrentToken());

        const result = (binaryPriority !== 0) && (binaryPriority > parentPriority);

        return result;
    }

    private parseUnaryExpression (): SyntaxNodes.UnaryExpression
    {
        const operator = this.consumeNextToken();
        const operatorPriority = OperatorOrder.getUnaryPriority(operator);
        const operand = this.parseExpression(operatorPriority);

        return new SyntaxNodes.UnaryExpression(operator, operand);
    }

    private parseBinaryExpression (left: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        const operator = this.consumeNextToken();
        const operatorPriority = OperatorOrder.getBinaryPriority(operator);
        const right = this.parseExpression(operatorPriority);

        return new SyntaxNodes.BinaryExpression(left, operator, right);
    }

    private parsePrimaryExpression (): SyntaxNodes.Expression
    {
        switch (this.getCurrentToken().kind)
        {
            case TokenKind.OpeningParenthesisToken:
                return this.parseParenthesizedExpression();
            case TokenKind.OpeningSquareBracketToken:
                return this.parseArrayLiteralExpression();
            case TokenKind.IntegerToken:
            case TokenKind.StringToken:
            case TokenKind.TrueKeyword:
            case TokenKind.FalseKeyword:
                return this.parseLiteralExpression();
            case TokenKind.IdentifierToken:
                return this.parseIdentifierExpression();
            default:
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Unknown expression "${this.getCurrentToken().content}"`,
                        DiagnosticCodes.UnknownExpressionError,
                        this.getCurrentToken()
                    )
                );
        }
    }

    private parseParenthesizedExpression (): SyntaxNodes.ParenthesizedExpression
    {
        const opening = this.consumeNextToken();
        const expression = this.parseExpression();
        const closing = this.consumeNextToken();

        return new SyntaxNodes.ParenthesizedExpression(opening, expression, closing);
    }

    private parseArrayLiteralExpression (): SyntaxNodes.ArrayLiteralExpression
    {
        const opening = this.consumeNextToken();
        const elements = this.parseArrayElements();
        const closing = this.consumeNextToken();

        return new SyntaxNodes.ArrayLiteralExpression(opening, elements, closing);
    }

    private parseLiteralExpression (): SyntaxNodes.LiteralExpression
    {
        const literal = this.consumeNextToken();

        return new SyntaxNodes.LiteralExpression(literal);
    }

    private parseIdentifierExpression (): SyntaxNodes.Expression
    {
        if (this.getFollowerToken().kind == TokenKind.OpeningParenthesisToken)
        {
            return this.parseCallExpression();
        }
        else
        {
            return this.parseVariableExpression();
        }
    }

    private parseCallExpression (): SyntaxNodes.CallExpression
    {
        const identifier = this.consumeNextToken();
        const opening = this.consumeNextToken();
        const callArguments = this.parseArguments();
        const closing = this.consumeNextToken();

        return new SyntaxNodes.CallExpression(identifier, opening, callArguments, closing);
    }

    private parseArguments (): CallArgumentsList
    {
        const expressions: SyntaxNodes.Expression[] = [];
        const separators: Token[] = [];

        while ((this.getCurrentToken().kind != TokenKind.ClosingParenthesisToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const expression = this.parseExpression();
            expressions.push(expression);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
            else
            {
                break;
            }
        }

        return new CallArgumentsList(expressions, separators);
    }

    private parseArrayElements (): ArrayElementsList
    {
        const elements: SyntaxNodes.Expression[] = [];
        const separators: Token[] = [];

        while ((this.getCurrentToken().kind != TokenKind.ClosingSquareBracketToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const element = this.parseExpression();
            elements.push(element);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
            else
            {
                break;
            }
        }

        return new ArrayElementsList(elements, separators);
    }

    private parseVariableExpression (): SyntaxNodes.VariableExpression
    {
        const identifier = this.consumeNextToken();

        return new SyntaxNodes.VariableExpression(identifier);
    }
}
