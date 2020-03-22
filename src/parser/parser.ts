import ArgumentsSyntaxNode from "./syntaxNodes/argumentsSyntaxNode";
import AssignmentSyntaxNode from "./syntaxNodes/assignmentSyntaxNode";
import BinaryExpressionSyntaxNode from "./syntaxNodes/binaryExpressionSyntaxNode";
import CallExpressionSyntaxNode from "./syntaxNodes/callExpressionSyntaxNode";
import ExpressionSyntaxNode from "./syntaxNodes/expressionSyntaxNode";
import FileSyntaxNode from "./syntaxNodes/fileSyntaxNode";
import InvalidTokenError from "../errors/invalidTokenError";
import LiteralExpressionSyntaxNode from "./syntaxNodes/literalExpressionSyntaxNode";
import NameExpressionSyntaxNode from "./syntaxNodes/nameExpressionSyntaxNode";
import OperatorOrder from "./operatorOrder";
import ParenthesizedExpressionSyntaxNode from "./syntaxNodes/parenthesizedExpressionSyntaxNode";
import SyntaxNode from "./syntaxNodes/syntaxNode";
import SyntaxType from "./syntaxType";
import Token from "../lexer/token";
import TokenType from "../lexer/tokenType";
import UnaryExpressionSyntaxNode from "./syntaxNodes/unaryExpressionSyntaxNode";
import UnknownTokenError from "../errors/unknownTokenError";
import VariableDeclarationSyntaxNode from "./syntaxNodes/variableDeclarationSyntaxNode";

export default class Parser
{
    private fileName: string;
    private tokens: Token[];
    private position: number;

    constructor ()
    {
        this.fileName = '';
        this.tokens = [];
        this.position = 0;
    }

    private getToken (relativePosition: number, increasePosition: boolean): Token
    {
        const index = this.position + relativePosition;
        let result: Token;

        if (index < this.tokens.length)
        {
            result = this.tokens[index];
        }
        else
        {
            result = new Token(TokenType.NoToken, '');
        }

        if (increasePosition)
        {
            this.position++;
        }

        return result;
    }

    private getNextToken (): Token
    {
        return this.getToken(0, true);
    }

    private get currentToken (): Token
    {
        return this.getToken(0, false);
    }

    private get followerToken (): Token
    {
        return this.getToken(1, false);
    }

    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @param fileName The name/path of the file
     * @return The root of the parsed syntax tree.
     */
    public run (tokens: Token[], fileName: string): SyntaxNode
    {
        this.tokens = tokens;
        this.fileName = fileName;
        this.position = 0;

        const root = this.parseFile();

        return root;
    }

    private parseFile (): FileSyntaxNode
    {
        const fileRoot = new SyntaxNode(SyntaxType.File); // TODO: Add file name to file syntax node (and create a file syntax node)!

        const sectionNodes = this.parseSection();

        fileRoot.children.push(...sectionNodes);

        return fileRoot;
    }

    private parseSection (): SyntaxNode[]
    {
        const nodes: SyntaxNode[] = [];

        while (this.currentToken.type != TokenType.NoToken)
        {
            const statement = this.parseStatement();
            nodes.push(statement);
        }

        return nodes;
    }

    private parseStatement (): SyntaxNode
    {
        let result: SyntaxNode;

        switch (this.currentToken.type)
        {
            case TokenType.VarKeyword:
                result = this.parseVariableDeclaration();
                break;
            default:
            {
                if (this.isAssignmentExpression())
                {
                    result = this.parseAssignment();
                }
                else
                {
                    result = this.parseExpression();
                }
            }
        }

        if (this.currentToken.type == TokenType.SemicolonToken)
        {
            // Remove the correct token:
            this.getNextToken();
        }
        else
        {
            throw new InvalidTokenError('Missing semicolon after statement.', this.fileName, this.currentToken);
        }

        return result;
    }

    private parseVariableDeclaration (): VariableDeclarationSyntaxNode
    {
        const keyword = this.getNextToken();
        let identifier: Token;
        let assignment: AssignmentSyntaxNode|null = null;

        if (this.followerToken.type == TokenType.AssignmentOperator)
        {
            identifier = this.currentToken;

            assignment = this.parseAssignment();
        }
        else
        {
            identifier = this.getNextToken();
        }

        return new VariableDeclarationSyntaxNode(keyword, identifier, assignment);
    }

    private isAssignmentExpression (): boolean
    {
        const result = (this.currentToken.type == TokenType.IdentifierToken) && (this.followerToken.type == TokenType.AssignmentOperator);

        return result;
    }

    private parseAssignment (): AssignmentSyntaxNode
    {
        const identifierToken = this.getNextToken();
        const operatorToken = this.getNextToken();
        const rightSide = this.parseExpression();

        const result = new AssignmentSyntaxNode(identifierToken, operatorToken, rightSide);

        return result;
    }

    private parseExpression (parentPriority = 0): ExpressionSyntaxNode
    {
        let left;

        if (this.isUnaryExpression(parentPriority))
        {
            left = this.parseUnaryExpression();
        }
        else
        {
            left = this.parsePrimaryExpression();
        }

        while (this.isBinaryExpression(parentPriority))
        {
            left = this.parseBinaryExpression(left);
        }

        return left;
    }

    private isUnaryExpression (parentPriority: number): boolean
    {
        const unaryPriority = OperatorOrder.getUnaryPriority(this.currentToken);

        const result = (unaryPriority !== 0) && (unaryPriority >= parentPriority);

        return result;
    }

    private isBinaryExpression (parentPriority: number): boolean
    {
        const binaryPriority = OperatorOrder.getBinaryPriority(this.currentToken);

        const result = (binaryPriority !== 0) && (binaryPriority > parentPriority);

        return result;
    }

    private parseUnaryExpression (): UnaryExpressionSyntaxNode
    {
        const operator = this.getNextToken();
        const operatorPriority = OperatorOrder.getUnaryPriority(operator);
        const operand = this.parseExpression(operatorPriority);

        return new UnaryExpressionSyntaxNode(operator, operand);
    }

    private parseBinaryExpression (left: SyntaxNode): BinaryExpressionSyntaxNode
    {
        const operator = this.getNextToken();
        const operatorPriority = OperatorOrder.getBinaryPriority(operator);
        const right = this.parseExpression(operatorPriority);

        return new BinaryExpressionSyntaxNode(left, operator, right);
    }

    private parsePrimaryExpression (): ExpressionSyntaxNode
    {
        switch (this.currentToken.type)
        {
            case TokenType.OpeningBracketToken:
                return this.parseParenthesizedExpression();
            case TokenType.IntegerToken:
            case TokenType.StringToken:
                return this.parseLiteralExpression();
            case TokenType.IdentifierToken:
                return this.parseIdentifierExpression();
            default:
                throw new UnknownTokenError('expression', this.fileName, this.currentToken);
        }
    }

    private parseParenthesizedExpression (): ParenthesizedExpressionSyntaxNode
    {
        const opening = this.getNextToken();
        const expression = this.parseExpression();
        const closing = this.getNextToken();

        return new ParenthesizedExpressionSyntaxNode(opening, expression, closing);
    }

    private parseLiteralExpression (): LiteralExpressionSyntaxNode
    {
        const literal = this.getNextToken();

        return new LiteralExpressionSyntaxNode(literal);
    }

    private parseIdentifierExpression (): ExpressionSyntaxNode
    {
        if (this.followerToken.type == TokenType.OpeningBracketToken)
        {
            return this.parseCallExpression();
        }
        else
        {
            return this.parseNameExpression();
        }
    }

    private parseCallExpression (): CallExpressionSyntaxNode
    {
        const identifier = this.getNextToken();
        const opening = this.getNextToken();
        const callArguments = this.parseArguments();
        const closing = this.getNextToken();

        return new CallExpressionSyntaxNode(identifier, opening, callArguments, closing);
    }

    private parseArguments (): ArgumentsSyntaxNode
    {
        const expressions: ExpressionSyntaxNode[] = [];
        const separators: Token[] = [];

        while ((this.currentToken.type != TokenType.ClosingBracketToken) && (this.currentToken.type != TokenType.NoToken))
        {
            const expression = this.parseExpression();
            expressions.push(expression);

            if (this.currentToken.type == TokenType.CommaOperator)
            {
                separators.push(this.getNextToken());
            }
            else
            {
                break;
            }
        }

        return new ArgumentsSyntaxNode(expressions, separators);
    }

    private parseNameExpression (): NameExpressionSyntaxNode
    {
        const identifier = this.getNextToken();

        return new NameExpressionSyntaxNode(identifier);
    }
}
