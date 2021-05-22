import ExpressionSyntaxNode from "../syntaxNodes/expressionSyntaxNode";
import Token from "../../lexer/token";

export default class CallArgumentsList
{
    public readonly expressions: ExpressionSyntaxNode[];
    public readonly separators: Token[];

    constructor (expressions: ExpressionSyntaxNode[], separators: Token[])
    {
        this.expressions = expressions;
        this.separators = separators;
    }
}
