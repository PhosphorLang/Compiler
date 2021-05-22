import CallArgumentsList from "../lists/callArgumentsList";
import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";

export default class CallExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly arguments: CallArgumentsList;
    public readonly closing: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return this.arguments.expressions;
    }

    public get token (): Token
    {
        return this.identifier;
    }

    constructor (identifier: Token, opening: Token, callArguments: CallArgumentsList, closing: Token)
    {
        super(SyntaxKind.CallExpression);

        this.identifier = identifier;
        this.opening = opening;
        this.arguments = callArguments;
        this.closing = closing;
    }
}
