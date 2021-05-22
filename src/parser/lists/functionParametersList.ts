import FunctionParameterSyntaxNode from "../syntaxNodes/functionParameterSyntaxNode";
import Token from "../../lexer/token";

export default class FunctionParametersList
{
    public readonly parameters: FunctionParameterSyntaxNode[];
    public readonly separators: Token[];

    constructor (parameters: FunctionParameterSyntaxNode[], separators: Token[])
    {
        this.parameters = parameters;
        this.separators = separators;
    }
}
