import FunctionParametersList from "../lists/functionParametersList";
import SectionSyntaxNode from "./sectionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";
import TypeClauseSyntaxNode from "./typeClauseSyntaxNode";

export default class FunctionDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly parameters: FunctionParametersList;
    public readonly closing: Token;
    public readonly type: TypeClauseSyntaxNode|null;
    public readonly body: SectionSyntaxNode|null;
    public readonly isExternal: boolean;

    public get children (): Iterable<SyntaxNode>
    {
        return this.parameters.parameters;
    }

    constructor (
        keyword: Token,
        identifier: Token,
        opening: Token,
        parameters: FunctionParametersList,
        closing: Token,
        type: TypeClauseSyntaxNode|null,
        body: SectionSyntaxNode|null,
        isExternal: boolean)
    {
        super(SyntaxKind.FunctionDeclaration);

        this.keyword = keyword;
        this.identifier = identifier;
        this.opening = opening;
        this.parameters = parameters;
        this.closing = closing;
        this.type = type;
        this.body = body;
        this.isExternal = isExternal;
    }
}
