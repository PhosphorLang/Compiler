enum SyntaxKind
{
    NoKind = 'NoKind',
    File = 'File',
    Section = 'Section',
    Import = 'Import',
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionParameter = 'FunctionParameter',
    TypeClause = 'TypeClause',
    ElseClause = 'ElseClause',
    // Statements
    Assignment = 'Assignment',
    VariableDeclaration = 'VariableDeclaration',
    ReturnStatement = 'ReturnStatement',
    IfStatement = 'IfStatement',
    WhileStatement = 'WhileStatement',
    // Expressions
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    ParenthesizedExpression = 'ParenthesizedExpression',
    LiteralExpression = 'LiteralExpression',
    ArrayLiteralExpression = 'ArrayLiteralExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
}

export default SyntaxKind;
