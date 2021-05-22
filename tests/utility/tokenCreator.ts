import BuildInTypes from '../../src/definitions/buildInTypes';
import Defaults from './defaults';
import Token from '../../src/lexer/token';
import TokenKind from '../../src/lexer/tokenKind';

export default abstract class TokenCreator
{
    public static newIdentifier (identifier = Defaults.identifier, line = 0, column = 0, fileName = Defaults.fileName): Token
    {
        return new Token(TokenKind.IdentifierToken, identifier, fileName, line, column);
    }

    public static newVariableIdentifier (identifier = Defaults.variableName): Token
    {
        return new Token(TokenKind.IdentifierToken, identifier);
    }

    public static newTypeIdentifier (identifier = BuildInTypes.int.name): Token
    {
        return new Token(TokenKind.IdentifierToken, identifier);
    }

    public static newInteger (value = Defaults.integer): Token
    {
        return new Token(TokenKind.IntegerToken, value);
    }

    public static newString (value = Defaults.string): Token
    {
        return new Token(TokenKind.StringToken, value);
    }

    public static newOpeningParenthesis (): Token
    {
        return new Token(TokenKind.OpeningParenthesisToken, '(');
    }

    public static newClosingParenthesis (): Token
    {
        return new Token(TokenKind.ClosingParenthesisToken, ')');
    }

    public static newOpeningBrace (): Token
    {
        return new Token(TokenKind.OpeningBraceToken, '{');
    }

    public static newClosingBrace (): Token
    {
        return new Token(TokenKind.ClosingBraceToken, '}');
    }

    public static newOpeningSquareBracket (): Token
    {
        return new Token(TokenKind.OpeningSquareBracketToken, '[');
    }

    public static newClosingSquareBracket (): Token
    {
        return new Token(TokenKind.ClosingSquareBracketToken, ']');
    }

    public static newColon (): Token
    {
        return new Token(TokenKind.ColonToken, ':');
    }

    public static newSemicolon (): Token
    {
        return new Token(TokenKind.SemicolonToken, ';');
    }

    public static newComma (): Token
    {
        return new Token(TokenKind.CommaToken, ',');
    }

    public static newAssignment (): Token
    {
        return new Token(TokenKind.AssignmentOperator, ':=');
    }

    public static newPlus (): Token
    {
        return new Token(TokenKind.PlusOperator, '+');
    }

    public static newMinus (): Token
    {
        return new Token(TokenKind.MinusOperator, '-');
    }

    public static newStar (): Token
    {
        return new Token(TokenKind.StarOperator, '*');
    }

    public static newSlash (): Token
    {
        return new Token(TokenKind.SlashOperator, '/');
    }

    public static newEqual (): Token
    {
        return new Token(TokenKind.EqualOperator, '=');
    }

    public static newLess (): Token
    {
        return new Token(TokenKind.LessOperator, '<');
    }

    public static newGreater (): Token
    {
        return new Token(TokenKind.GreaterOperator, '>');
    }

    public static newVarKeyword (): Token
    {
        return new Token(TokenKind.VarKeyword, 'var');
    }

    public static newFunctionKeyword (): Token
    {
        return new Token(TokenKind.FunctionKeyword, 'function');
    }

    public static newReturnKeyword (): Token
    {
        return new Token(TokenKind.ReturnKeyword, 'return');
    }

    public static newIfKeyword (): Token
    {
        return new Token(TokenKind.IfKeyword, 'if');
    }

    public static newElseKeyword (): Token
    {
        return new Token(TokenKind.ElseKeyword, 'else');
    }

    public static newTrueKeyword (): Token
    {
        return new Token(TokenKind.TrueKeyword, 'true');
    }

    public static newFalseKeyword (): Token
    {
        return new Token(TokenKind.FalseKeyword, 'false');
    }

    public static newWhileKeyword (): Token
    {
        return new Token(TokenKind.WhileKeyword, 'while');
    }

    public static newImportKeyword (): Token
    {
        return new Token(TokenKind.ImportKeyword, 'import');
    }
}
