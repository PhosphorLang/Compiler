import LexicalType from './lexicalType';
import Operator from '../definitions/operator';
import Token from './token';

export default class Lexer
{
    private tokenSplitterRegex: RegExp;

    private numberTestRegex: RegExp;
    private stringTestRegex: RegExp;
    private idTestRegex: RegExp;

    private operatorList: Set<string>;

    constructor ()
    {
        this.tokenSplitterRegex = /'(.*?)'|\d+|[a-zA-Z]+|\S/g;

        this.numberTestRegex = /^\d+$/;
        this.stringTestRegex = /^'.*'$/;
        this.idTestRegex = /^[a-zA-Z]+$/;

        this.operatorList = new Set();
        for (const operator of Object.values(Operator))
        {
            this.operatorList.add(operator);
        }
    }

    /**
     * Run the lexer.
     * @param fileContent The content of the file
     * @param filePath The path of the file
     */
    public run (fileContent: string, filePath: string): Token[]
    {
        const tokens: Token[] = [];

        const fileToken = new Token(LexicalType.File, filePath);
        tokens.push(fileToken);

        let match: RegExpExecArray | null;
        do
        {
            match = this.tokenSplitterRegex.exec(fileContent);
            if (match)
            {
                const fullMatch = match[0];

                let token: Token;

                if (this.numberTestRegex.test(fullMatch))
                {
                    token = new Token(LexicalType.Number, fullMatch);
                }
                else if (this.stringTestRegex.test(fullMatch))
                {
                    const stringContent = match[1];

                    token = new Token(LexicalType.String, stringContent);
                }
                else if (this.operatorList.has(fullMatch))
                {
                    token = new Token(LexicalType.Operator, fullMatch);
                }
                else if (this.idTestRegex.test(fullMatch))
                {
                    token = new Token(LexicalType.Id, fullMatch);
                }
                else
                {
                    throw new Error('Unknown token "' + fullMatch + '"');
                }

                tokens.push(token);
            }
        }
        while (match);

        return tokens;
    }
}
