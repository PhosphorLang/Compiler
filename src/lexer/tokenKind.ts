enum TokenKind
{
    NoToken,
    // Tokens
    IdentifierToken,
    IntegerToken,
    StringToken,
    OpeningParenthesisToken,
    ClosingParenthesisToken,
    OpeningBraceToken,
    ClosingBraceToken,
    OpeningSquareBracketToken,
    ClosingSquareBracketToken,
    ColonToken,
    SemicolonToken,
    CommaToken,
    // Operators
    AssignmentOperator,
    PlusOperator,
    MinusOperator,
    StarOperator,
    SlashOperator,
    EqualOperator,
    LessOperator,
    GreaterOperator,
    // Keywords
    VarKeyword,
    FunctionKeyword,
    ReturnKeyword,
    ExternalKeyword,
    IfKeyword,
    ElseKeyword,
    WhileKeyword,
    TrueKeyword,
    FalseKeyword,
    ImportKeyword,
}

export default TokenKind;
