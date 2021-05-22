import ExpressionSyntaxNode from "../syntaxNodes/expressionSyntaxNode";
import Token from "../../lexer/token";

export default class ArrayElementsList
{
    public readonly elements: ExpressionSyntaxNode[];
    public readonly separators: Token[];

    constructor (elements: ExpressionSyntaxNode[], separators: Token[])
    {
        this.elements = elements;
        this.separators = separators;
    }
}
