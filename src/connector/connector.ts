import * as SemanticNodes from "./semanticNodes";
import * as SemanticSymbols from "./semanticSymbols";
import * as SyntaxNodes from "../parser/syntaxNodes";
import BuildInOperators from "../definitions/buildInOperators";
import BuildInTypes from "../definitions/buildInTypes";
import Diagnostic from "../diagnostic/diagnostic";
import DiagnosticCodes from "../diagnostic/diagnosticCodes";
import DiagnosticError from "../diagnostic/diagnosticError";
import FunctionParametersList from "../parser/lists/functionParametersList";
import ImportNodeToFileNode from "../importer/importNodeToFileNode";
import { SemanticNode } from "./semanticNodes";
import SyntaxKind from "../parser/syntaxKind";
import { SyntaxNode } from "../parser/syntaxNodes";

export default class Connector
{
    private readonly diagnostic: Diagnostic;

    /**
     * A list of functions, global to the file.
     * This is filled before the function bodies are connected, so every function can reference every other function,
     * regardless of their position.
     */
    private functions: Map<string, SemanticSymbols.Function>;
    /**
     * A list of variable lists, working as a stack.
     * While connecting the function bodies, at the beginning of each section a new list is pushed, at the end of the section it is removed.
     * With this we keep track of which variables are accessible at which point in the code.
     */
    private variableStacks: Map<string, SemanticSymbols.Variable>[];

    private currentFunction: SemanticSymbols.Function|null;

    constructor (diagnostic: Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.functions = new Map<string, SemanticSymbols.Function>();
        this.variableStacks = [];
        this.currentFunction = null;
    }

    public run (fileSyntaxNode: SyntaxNodes.File, importedSyntaxTrees: ImportNodeToFileNode): SemanticNodes.File
    {
        this.functions.clear();
        this.variableStacks = [];
        this.currentFunction = null;

        const result = this.connectFile(fileSyntaxNode, importedSyntaxTrees);

        return result;
    }

    private pushVariable (variable: SemanticSymbols.Variable): void
    {
        const currentVariableStack = this.variableStacks[this.variableStacks.length - 1];

        currentVariableStack.set(variable.name, variable);
    }

    private getVariable (name: string): SemanticSymbols.Variable|null
    {
        for (const variableStack of this.variableStacks)
        {
            for (const variable of variableStack.values())
            {
                if (variable.name == name)
                {
                    return variable;
                }
            }
        }

        return null;
    }

    private connectFile (file: SyntaxNodes.File, importedSyntaxTrees: ImportNodeToFileNode): SemanticNodes.File
    {
        const functionNodes: SemanticNodes.FunctionDeclaration[] = [];
        const importNodes: SemanticNodes.Import[] = [];

        for (const importSyntaxNode of file.imports)
        {
            const importedFileSyntaxNode = importedSyntaxTrees.get(importSyntaxNode);

            if (importedFileSyntaxNode === undefined)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Could not find file "${importSyntaxNode.path.content}" for import.`,
                        DiagnosticCodes.CannotFindImportFileError,
                        importSyntaxNode.path
                    )
                );
            }
            else
            {
                const importedFileNode = this.connectFile(importedFileSyntaxNode, importedSyntaxTrees);

                const importNode = new SemanticNodes.Import(importSyntaxNode.path.content, importedFileNode);
                importNodes.push(importNode);
            }
        }

        // Function declarations:
        for (const functionDeclaration of file.functions)
        {
            const functionSymbol = this.connectFunctionDeclaration(functionDeclaration);

            this.functions.set(functionSymbol.name, functionSymbol);
        }

        // Function bodies:
        for (const functionDeclaration of file.functions)
        {
            const functionNode = this.connectFunction(functionDeclaration);

            functionNodes.push(functionNode);
        }

        return new SemanticNodes.File(file.name, importNodes, functionNodes);
    }

    private connectFunctionDeclaration (functionDeclaration: SyntaxNodes.FunctionDeclaration): SemanticSymbols.Function
    {
        const name = functionDeclaration.identifier.content;
        const returnType = this.connectType(functionDeclaration.type) ?? BuildInTypes.noType;
        const parameters = this.connectParameters(functionDeclaration.parameters);
        const isExternal = functionDeclaration.isExternal;

        return new SemanticSymbols.Function(name, returnType, parameters, isExternal);
    }

    private connectType (typeClause: SyntaxNodes.TypeClause|null): SemanticSymbols.Type|null
    {
        if (typeClause === null)
        {
            return null;
        }
        else
        {
            const type = BuildInTypes.getTypeByName(typeClause.identifier.content);

            if (type === null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Unknown type "${typeClause.identifier.content}"`,
                        DiagnosticCodes.UnknownTypeError,
                        typeClause.identifier
                    )
                );
            }

            return type;
        }
    }

    private connectParameters (parameters: FunctionParametersList): SemanticSymbols.Parameter[]
    {
        const parameterSymbols: SemanticSymbols.Parameter[] = [];

        const names = new Set<string>();

        for (const parameter of parameters.parameters)
        {
            const name = parameter.identifier.content;

            if (names.has(name))
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Duplicate parameter name "${name}"`,
                        DiagnosticCodes.DuplicateParameterNameError,
                        parameter.identifier
                    )
                );
            }

            names.add(name);

            const type = this.connectType(parameter.type);

            if (type === null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        'Parameters must have a type clause given.',
                        DiagnosticCodes.ParameterWithoutTypeClauseError,
                        parameter.identifier
                    )
                );
            }

            const parameterSymbol = new SemanticSymbols.Parameter(name, type);

            parameterSymbols.push(parameterSymbol);
        }

        return parameterSymbols;
    }

    private connectFunction (functionDeclaration: SyntaxNodes.FunctionDeclaration): SemanticNodes.FunctionDeclaration
    {
        const functionSymbol = this.functions.get(functionDeclaration.identifier.content) as SemanticSymbols.Function;
        // The function symbol must exist because we added it previously based on the same function declarations.

        this.currentFunction = functionSymbol;

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variableStacks.push(variables);

        // Push all parameters to the variable stack:
        for (const parameter of functionSymbol.parameters)
        {
            this.pushVariable(parameter);
        }

        let section: SemanticNodes.Section|null = null;
        if (functionDeclaration.body !== null)
        {
            section = this.connectSection(functionDeclaration.body);
        }

        // Remove the list of variables from the variable stack:
        this.variableStacks.pop();

        this.currentFunction = null;

        return new SemanticNodes.FunctionDeclaration(functionSymbol, section);
    }

    private connectSection (sectionSyntaxNode: SyntaxNodes.Section): SemanticNodes.Section
    {
        const statementNodes: SemanticNode[] = [];

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variableStacks.push(variables);

        for (const statement of sectionSyntaxNode.statements)
        {
            const statementNode = this.connectStatement(statement);

            statementNodes.push(statementNode);
        }

        // Remove the list of variables from the variable stack:
        this.variableStacks.pop();

        return new SemanticNodes.Section(statementNodes);
    }

    private connectStatement (statement: SyntaxNode): SemanticNode
    {
        switch (statement.kind)
        {
            case SyntaxKind.Section:
                return this.connectSection(statement as SyntaxNodes.Section);
            case SyntaxKind.VariableDeclaration:
                return this.connectVariableDeclaration(statement as SyntaxNodes.VariableDeclaration);
            case SyntaxKind.ReturnStatement:
                return this.connectReturnStatement(statement as SyntaxNodes.ReturnStatement);
            case SyntaxKind.IfStatement:
                return this.connectIfStatement(statement as SyntaxNodes.IfStatement);
            case SyntaxKind.WhileStatement:
                return this.connectWhileStatement(statement as SyntaxNodes.WhileStatement);
            case SyntaxKind.Assignment:
                return this.connectAssignment(statement as SyntaxNodes.Assignment);
            default:
                return this.connectExpression(statement as SyntaxNodes.Expression);
        }
    }

    private connectVariableDeclaration (variableDeclaration: SyntaxNodes.VariableDeclaration): SemanticNodes.VariableDeclaration
    {
        const name = variableDeclaration.identifier.content;
        const initialisier = variableDeclaration.initialiser === null ? null : this.connectExpression(variableDeclaration.initialiser);
        let type = this.connectType(variableDeclaration.type);

        if (type === null)
        {
            if (initialisier === null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        `The variable "${name}" must either have a type clause or an initialiser.`,
                        DiagnosticCodes.VariableWithoutTypeClauseAndInitialiserError,
                        variableDeclaration.identifier
                    )
                );
            }
            else
            {
                type = initialisier.type;
            }
        }

        const variable = new SemanticSymbols.Variable(name, type, false);

        if (this.getVariable(name) !== null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Duplicate declaration of variable "${name}".`,
                    DiagnosticCodes.DuplicateVariableDeclarationError,
                    variableDeclaration.identifier
                )
            );
        }

        this.pushVariable(variable);

        return new SemanticNodes.VariableDeclaration(variable, initialisier);
    }

    private connectReturnStatement (returnStatement: SyntaxNodes.ReturnStatement): SemanticNodes.ReturnStatement
    {
        if (this.currentFunction === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    'Return statements must be placed inside a function body.',
                    DiagnosticCodes.ReturnStatementOutsideFunctionBodyError,
                    returnStatement.keyword
                )
            );
        }

        let expression: SemanticNodes.Expression|null = null;

        if (returnStatement.expression !== null)
        {
            expression = this.connectExpression(returnStatement.expression);
        }

        if (this.currentFunction.returnType == BuildInTypes.noType)
        {
            if (expression !== null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        'A function without a return type must return nothing.',
                        DiagnosticCodes.NotEmptyReturnInFunctionWithoutReturnTypeError,
                        returnStatement.keyword
                    )
                );
            }
        }
        else
        {
            if (expression === null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        'A function with a return type must not return nothing.',
                        DiagnosticCodes.EmptyReturnInFunctionWithReturnTypeError,
                        returnStatement.keyword
                    )
                );
            }
            else if (expression.type != this.currentFunction.returnType)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        'The return value type must match the function return type.',
                        DiagnosticCodes.ReturnTypeDoesNotMatchFunctionReturnTypeError,
                        returnStatement.keyword
                    )
                );
            }
        }

        return new SemanticNodes.ReturnStatement(expression);
    }

    private connectIfStatement (ifStatement: SyntaxNodes.IfStatement): SemanticNodes.IfStatement
    {
        const condition = this.connectExpression(ifStatement.condition);

        if (condition.type !== BuildInTypes.bool)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    'The return type of the condition in an if statement must be Bool.',
                    DiagnosticCodes.UnexpectedNonBooleanExpressionInIfStatementError,
                    ifStatement.condition.token
                )
            );
        }

        const section = this.connectSection(ifStatement.section);
        let elseClause: SemanticNodes.ElseClause|null = null;

        if (ifStatement.elseClause !== null)
        {
            elseClause = this.connectElseClause(ifStatement.elseClause);
        }

        return new SemanticNodes.IfStatement(condition, section, elseClause);
    }

    private connectElseClause (elseClause: SyntaxNodes.ElseClause): SemanticNodes.ElseClause
    {
        let followUp: SemanticNodes.Section|SemanticNodes.IfStatement;

        if (elseClause.followUp.kind == SyntaxKind.Section)
        {
            followUp = this.connectSection(elseClause.followUp as SyntaxNodes.Section);
        }
        else
        {
            followUp = this.connectIfStatement(elseClause.followUp as SyntaxNodes.IfStatement);
        }

        return new SemanticNodes.ElseClause(followUp);
    }

    private connectWhileStatement (whileStatement: SyntaxNodes.WhileStatement): SemanticNodes.WhileStatement
    {
        const condition = this.connectExpression(whileStatement.condition);

        if (condition.type !== BuildInTypes.bool)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    'The return type of the condition in an while statement must be Bool.',
                    DiagnosticCodes.UnexpectedNonBooleanExpressionInWhileStatementError,
                    whileStatement.condition.token
                )
            );
        }

        const section = this.connectSection(whileStatement.section);

        return new SemanticNodes.WhileStatement(condition, section);
    }

    private connectAssignment (assignment: SyntaxNodes.Assignment): SemanticNodes.Assignment
    {
        const name = assignment.identifier.content;

        const variable = this.getVariable(name);

        if (variable === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Unknown variable "${name}"`,
                    DiagnosticCodes.UnknownVariableError,
                    assignment.identifier
                )
            );
        }

        if (variable.isReadonly)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `"${name}" is readonly, an assignment is not allowed.`,
                    DiagnosticCodes.ReadonlyAssignmentError,
                    assignment.identifier
                )
            );
        }

        const expression = this.connectExpression(assignment.expression);

        return new SemanticNodes.Assignment(variable, expression);
    }

    private connectExpression (expression: SyntaxNodes.Expression): SemanticNodes.Expression
    {
        switch (expression.kind)
        {
            case SyntaxKind.LiteralExpression:
                return this.connectLiteralExpression(expression as SyntaxNodes.LiteralExpression);
            case SyntaxKind.VariableExpression:
                return this.connectVariableExpression(expression as SyntaxNodes.VariableExpression);
            case SyntaxKind.CallExpression:
                return this.connectCallExpression(expression as SyntaxNodes.CallExpression);
            case SyntaxKind.ParenthesizedExpression:
                return this.connectParenthesizedExpression(expression as SyntaxNodes.ParenthesizedExpression);
            case SyntaxKind.UnaryExpression:
                return this.connectUnaryExpression(expression as SyntaxNodes.UnaryExpression);
            case SyntaxKind.BinaryExpression:
                return this.connectBinaryExpression(expression as SyntaxNodes.BinaryExpression);
            default:
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Unexpected syntax of kind "${expression.kind}".`,
                        DiagnosticCodes.UnexpectedExpressionSyntaxKindError,
                        expression.token
                    )
                );
        }
    }

    private connectLiteralExpression (expression: SyntaxNodes.LiteralExpression): SemanticNodes.LiteralExpression
    {
        const value = expression.literal.content;
        const type = BuildInTypes.getTypeByTokenKind(expression.literal.kind);

        if (type === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Unexpected literal "${expression.literal.content}" of type "${expression.kind}".`,
                    DiagnosticCodes.UnexpectedLiteralExpressionSyntaxKindError,
                    expression.literal
                )
            );
        }

        return new SemanticNodes.LiteralExpression(value, type);
    }

    private connectVariableExpression (expression: SyntaxNodes.VariableExpression): SemanticNodes.VariableExpression
    {
        const name = expression.identifier.content;

        const variable = this.getVariable(name);

        if (variable === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Unknown variable "${name}"`,
                    DiagnosticCodes.UnknownVariableError,
                    expression.identifier
                )
            );
        }

        return new SemanticNodes.VariableExpression(variable);
    }

    private connectCallExpression (expression: SyntaxNodes.CallExpression): SemanticNodes.CallExpression
    {
        const functionSymbol = this.functions.get(expression.identifier.content);

        if (functionSymbol === undefined)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Unknown function "${expression.identifier.content}"`,
                    DiagnosticCodes.UnknownFunctionError,
                    expression.identifier
                )
            );
        }

        const callArguments: SemanticNodes.Expression[] = [];

        for (const argumentExpression of expression.arguments.expressions)
        {
            const callArgument = this.connectExpression(argumentExpression);
            callArguments.push(callArgument);
        }

        if (functionSymbol.parameters.length !== callArguments.length)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Wrong argument count for function "${expression.identifier.content}"`,
                    DiagnosticCodes.WrongArgumentCountError,
                    expression.identifier
                )
            );
        }

        for (let i = 0; i < callArguments.length; i++)
        {
            if (callArguments[i].type !== functionSymbol.parameters[i].type)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Wrong type for argument "${functionSymbol.parameters[i].name}".`,
                        DiagnosticCodes.WrongArgumentTypeError,
                        expression.identifier
                    )
                );
            }
        }

        return new SemanticNodes.CallExpression(functionSymbol, callArguments);
    }

    private connectParenthesizedExpression (expression: SyntaxNodes.ParenthesizedExpression): SemanticNodes.Expression
    {
        return this.connectExpression(expression.expression);
    }

    private connectUnaryExpression (expression: SyntaxNodes.UnaryExpression): SemanticNodes.UnaryExpression
    {
        const operand = this.connectExpression(expression.operand);

        const operator = BuildInOperators.getUnaryOperator(expression.operator.kind, operand.type);

        if (operator === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Unknown unary operator "${expression.operator.content}"`,
                    DiagnosticCodes.UnknownUnaryOperatorError,
                    expression.operator
                )
            );
        }

        return new SemanticNodes.UnaryExpression(operator, operand);
    }

    private connectBinaryExpression (expression: SyntaxNodes.BinaryExpression): SemanticNodes.BinaryExpression
    {
        const leftOperand = this.connectExpression(expression.leftSide);
        const rightOperand = this.connectExpression(expression.rightSide);

        const operator = BuildInOperators.getBinaryOperator(expression.operator.kind, leftOperand.type, rightOperand.type);

        if (operator === null)
        {
            this.diagnostic.throw(
                new DiagnosticError(
                    `Unknown binary operator "${expression.operator.content}" for "${leftOperand.type.name}" with "${rightOperand.type.name}"`,
                    DiagnosticCodes.UnknownBinaryOperatorError,
                    expression.operator
                )
            );
        }

        return new SemanticNodes.BinaryExpression(operator, leftOperand, rightOperand);
    }
}
