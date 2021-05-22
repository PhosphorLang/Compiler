import ArrayElementsList from "../lists/arrayElementsList";
import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";

export default class ArrayLiteralExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly opening: Token;
    public readonly closing: Token;
    public readonly elements: ArrayElementsList;

    public get children (): Iterable<SyntaxNode>
    {
        return this.elements.elements;
    }

    public get token (): Token
    {
        return this.opening;
    }

    constructor (opening: Token, elements: ArrayElementsList, closing: Token)
    {
        super(SyntaxKind.ArrayLiteralExpression);

        this.opening = opening;
        this.elements = elements;
        this.closing = closing;
    }
}
