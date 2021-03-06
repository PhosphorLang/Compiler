import Instruction from "./instruction";

export default class LabelInstruction extends Instruction
{
    protected readonly postfix = ':';

    public get text (): string
    {
        return this.commandString + this.postfix;
    }

    constructor (text: string)
    {
        super(text);
    }
}
