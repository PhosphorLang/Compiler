import * as SyntaxNodes from '../../src/parser/syntaxNodes';
import ArrayElementsList from '../../src/parser/lists/arrayElementsList';
import CallArgumentsList from '../../src/parser/lists/callArgumentsList';
import Defaults from './defaults';
import FunctionParametersList from '../../src/parser/lists/functionParametersList';
import Token from '../../src/lexer/token';
import TokenCreator from './tokenCreator';

export default abstract class SyntaxCreator
{
    public static newFile (
        functions: SyntaxNodes.FunctionDeclaration[] = [],
        imports: SyntaxNodes.Import[] = [],
        fileName = Defaults.fileName
    ): SyntaxNodes.File
    {
        return new SyntaxNodes.File(fileName, imports, functions);
    }

    public static newFunctionDeclaration (
        section = SyntaxCreator.newSection(),
        parameters = SyntaxCreator.newFunctionParametersList(),
        type: SyntaxNodes.TypeClause|null = null,
        identifier = TokenCreator.newIdentifier(),
        isExternal = false,
    ): SyntaxNodes.FunctionDeclaration
    {
        return new SyntaxNodes.FunctionDeclaration(
            TokenCreator.newFunctionKeyword(),
            identifier,
            TokenCreator.newOpeningParenthesis(),
            parameters,
            TokenCreator.newClosingParenthesis(),
            type,
            section,
            isExternal
        );
    }

    public static newSection (statements: SyntaxNodes.SyntaxNode[] = []): SyntaxNodes.Section
    {
        return new SyntaxNodes.Section(TokenCreator.newOpeningBrace(), statements, TokenCreator.newClosingBrace());
    }

    public static newFunctionParametersList (parameters: SyntaxNodes.FunctionParameter[] = []): FunctionParametersList
    {
        const separators: Token[] = [];

        for (let i = 0; i < parameters.length - 1; i++) // - 1 because we need one separator less than expressions.
        {
            separators.push(TokenCreator.newComma());
        }

        return new FunctionParametersList(parameters, separators);
    }

    public static newFunctionParameter (
        identifier = TokenCreator.newVariableIdentifier(),
        typeClause = SyntaxCreator.newTypeClause()
    ): SyntaxNodes.FunctionParameter
    {
        return new SyntaxNodes.FunctionParameter(identifier, typeClause);
    }

    public static newTypeClause (identifier = TokenCreator.newTypeIdentifier()): SyntaxNodes.TypeClause
    {
        return new SyntaxNodes.TypeClause(TokenCreator.newColon(), identifier);
    }

    public static newFunctionCall (
        callArguments = SyntaxCreator.newCallArgumentsList(),
        identifier = TokenCreator.newIdentifier()
    ): SyntaxNodes.CallExpression
    {
        return new SyntaxNodes.CallExpression(
            identifier,
            TokenCreator.newOpeningParenthesis(),
            callArguments,
            TokenCreator.newClosingParenthesis()
        );
    }

    public static newCallArgumentsList (expressions: SyntaxNodes.Expression[] = []): CallArgumentsList
    {
        const separators: Token[] = [];

        for (let i = 0; i < expressions.length - 1; i++) // - 1 because we need one separator less than expressions.
        {
            separators.push(TokenCreator.newComma());
        }

        return new CallArgumentsList(expressions, separators);
    }

    public static newVariableDeclaration (
        initialiser: SyntaxNodes.Expression|null = null,
        typeClause: SyntaxNodes.TypeClause|null = null,
        identifier = TokenCreator.newVariableIdentifier(),
    ): SyntaxNodes.VariableDeclaration
    {
        const assignment = initialiser === null ? null : TokenCreator.newAssignment();

        return new SyntaxNodes.VariableDeclaration(TokenCreator.newVarKeyword(), identifier, typeClause, assignment, initialiser);
    }

    public static newAssignment (
        expression: SyntaxNodes.Expression,
        identifier = TokenCreator.newVariableIdentifier()
    ): SyntaxNodes.Assignment
    {
        return new SyntaxNodes.Assignment(identifier, TokenCreator.newAssignment(), expression);
    }

    public static newIntegerLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newInteger());
    }

    public static newStringLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newString());
    }

    public static newTrueBooleanLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newTrueKeyword());
    }

    public static newFalseBooleanLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newFalseKeyword());
    }

    public static newArrayLiteral (arrayElements = this.newArrayElementsList()): SyntaxNodes.ArrayLiteralExpression
    {
        return new SyntaxNodes.ArrayLiteralExpression(
            TokenCreator.newOpeningSquareBracket(),
            arrayElements,
            TokenCreator.newClosingSquareBracket()
        );
    }

    public static newArrayElementsList (elements: SyntaxNodes.Expression[] = []): ArrayElementsList
    {
        const separators: Token[] = [];

        for (let i = 0; i < elements.length - 1; i++) // - 1 because we need one separator less than elements.
        {
            separators.push(TokenCreator.newComma());
        }

        return new ArrayElementsList(elements, separators);
    }

    public static newBinaryExpression (left: SyntaxNodes.Expression, operator: Token, right: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        return new SyntaxNodes.BinaryExpression(
            left,
            operator,
            right
        );
    }

    public static newAddition (left: SyntaxNodes.Expression, right: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        return SyntaxCreator.newBinaryExpression(
            left,
            TokenCreator.newPlus(),
            right
        );
    }

    public static newIntegerAddition (): SyntaxNodes.BinaryExpression
    {
        return SyntaxCreator.newAddition(
            SyntaxCreator.newIntegerLiteral(),
            SyntaxCreator.newIntegerLiteral()
        );
    }

    public static newParenthesizedExpression (expression: SyntaxNodes.Expression): SyntaxNodes.ParenthesizedExpression
    {
        return new SyntaxNodes.ParenthesizedExpression(
            TokenCreator.newOpeningParenthesis(),
            expression,
            TokenCreator.newClosingParenthesis()
        );
    }

    public static newReturn (expression: SyntaxNodes.Expression|null = null): SyntaxNodes.ReturnStatement
    {
        return new SyntaxNodes.ReturnStatement(TokenCreator.newReturnKeyword(), expression);
    }

    public static newUnaryExpression (operand: SyntaxNodes.Expression, operator: Token): SyntaxNodes.UnaryExpression
    {
        return new SyntaxNodes.UnaryExpression(operator, operand);
    }

    public static newIntegerNegation (): SyntaxNodes.UnaryExpression
    {
        return SyntaxCreator.newUnaryExpression(SyntaxCreator.newIntegerLiteral(), TokenCreator.newMinus());
    }

    public static newVariableExpression (identifier = TokenCreator.newVariableIdentifier()): SyntaxNodes.VariableExpression
    {
        return new SyntaxNodes.VariableExpression(identifier);
    }

    public static newIfStatement (
        condition: SyntaxNodes.Expression = SyntaxCreator.newTrueBooleanLiteral(),
        section = SyntaxCreator.newSection(),
        elseClause: SyntaxNodes.ElseClause|null = null
    ): SyntaxNodes.IfStatement
    {
        return new SyntaxNodes.IfStatement(TokenCreator.newIfKeyword(), condition, section, elseClause);
    }

    public static newElseClause (followUp: SyntaxNodes.Section|SyntaxNodes.IfStatement = SyntaxCreator.newSection()): SyntaxNodes.ElseClause
    {
        return new SyntaxNodes.ElseClause(TokenCreator.newElseKeyword(), followUp);
    }

    public static newWhileStatement (
        condition: SyntaxNodes.Expression = SyntaxCreator.newTrueBooleanLiteral(),
        section = SyntaxCreator.newSection()
    ): SyntaxNodes.WhileStatement
    {
        return new SyntaxNodes.WhileStatement(TokenCreator.newWhileKeyword(), condition, section);
    }

    public static newImport (path = TokenCreator.newString(Defaults.importFileName)): SyntaxNodes.Import
    {
        return new SyntaxNodes.Import(TokenCreator.newImportKeyword(), path);
    }
}
