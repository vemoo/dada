/// <reference path="./node_modules/tree-sitter-cli/dsl.d.ts" />

const Prec = {
    variable_declaration: 0,
    break: 1,
    return: 2,
    assign: 3,
    comparative: 4,
    additive: 5,
    multiplicative: 6,
    unary: 7,
    call: 8,
    dot: 9,
};

const BinaryOps = [
    { ops: ["+=", "-=", "/=", "*=", ":="], prec: Prec.assign },
    { ops: ["==", "<", ">", "<=", ">="], prec: Prec.comparative },
    { ops: ["+", "-"], prec: Prec.additive },
    { ops: ["/", "*"], prec: Prec.multiplicative },
];

// not defined as rules because at the moment rules cannot be use inside tokens
// https://github.com/tree-sitter/tree-sitter/issues/449#issuecomment-533702316
const NumberPart = /[0-9][0-9_]*/;
const Identifier = /[A-Za-z_][A-Za-z0-9_]*/;

module.exports = grammar({
    name: "dada",
    word: ($) => $.identifier,
    extras: ($) => [$.comment, /\s/],
    supertypes: ($) => [$.item, $.expr],
    rules: {
        source_file: ($) => repeat(choice($.item, $.expr)),
        comment: () => token(seq("#", /[^\n]*/)),
        _list_sep: () => choice(",", "\n"),
        item: ($) => choice($.class, $.function),
        _parameter_or_variable: ($) =>
            prec.left(
                -1,
                seq(
                    optional("atomic"),
                    $.identifier,
                    optional($.type_annotation)
                )
            ),
        type_annotation: ($) => seq(":", $.type),
        parameter: ($) => $._parameter_or_variable,
        parameters: ($) => seq("(", list($.parameter, $._list_sep), ")"),
        class: ($) => seq("class", field("name", $.identifier), $.parameters),
        function: ($) =>
            seq(
                optional("async"),
                "fn",
                field("name", $.identifier),
                $.parameters,
                optional("->"),
                $.block_expr
            ),
        expr: ($) =>
            choice(
                $.variable_declaration,
                $.continue,
                $.break,
                $.return,
                $.identifier,
                $.integer_literal,
                $.float_literal,
                $.boolean_literal,
                $.format_string,
                $.binary_op_expr,
                $.unary_expr,
                $.dot_expr,
                $.call_expr,
                $.parenthesized_expr,
                $.block_expr,
                $.atomic_expr,
                $.loop_expr,
                $.while_expr,
                $.if_expr,
                $.tuple_expr
            ),
        identifier: () => Identifier,
        type: ($) => $.identifier,
        variable_declaration: ($) =>
            prec.left(
                Prec.variable_declaration,
                seq(
                    $._parameter_or_variable,
                    optional(seq(":", $.type)),
                    "=",
                    $.expr
                )
            ),
        continue: () => "continue",
        break: ($) => prec.left(Prec.break, seq("break", optional($.expr))),
        return: ($) => prec.left(Prec.return, seq("return", optional($.expr))),
        integer_literal: () =>
            token(seq(NumberPart, optional(token.immediate(Identifier)))),
        float_literal: () =>
            token(
                seq(
                    NumberPart,
                    token.immediate("."),
                    token.immediate(NumberPart)
                )
            ),
        boolean_literal: () => choice("true", "false"),
        format_string: ($) =>
            seq(
                '"',
                repeat(choice(/\\./, /[^"{\\]+/, seq("{", $.expr, "}"))),
                '"'
            ),
        binary_op_expr: ($) =>
            choice(
                ...BinaryOps.map((binOp) =>
                    prec.left(
                        binOp.prec,
                        seq(
                            field("lhs", $.expr),
                            field("op", choice(...binOp.ops)),
                            field("rhs", $.expr)
                        )
                    )
                )
            ),
        unary_expr: ($) => prec.left(Prec.unary, seq("-", $.expr)),
        dot_expr: ($) =>
            prec.left(
                Prec.dot,
                seq(
                    $.expr,
                    ".",
                    choice(
                        // tuple index
                        NumberPart,
                        "await",
                        "share",
                        "give",
                        "lease",
                        "shlease",
                        $.identifier
                    )
                )
            ),
        call_expr: ($) =>
            prec.left(
                Prec.call,
                seq(
                    $.expr,
                    seq(
                        "(",
                        list(
                            seq(optional(seq($.identifier, ":")), $.expr),
                            $._list_sep
                        ),
                        ")"
                    )
                )
            ),
        parenthesized_expr: ($) => seq("(", $.expr, ")"),
        block_expr: ($) => seq("{", list($.expr, $._list_sep), "}"),
        atomic_expr: ($) => seq("atomic", $.block_expr),
        loop_expr: ($) => seq("loop", $.block_expr),
        while_expr: ($) => seq("while", $.expr, $.block_expr),
        if_expr: ($) =>
            seq(
                "if",
                $.expr,
                $.block_expr,
                optional(seq("else", $.block_expr))
            ),
        tuple_expr: ($) =>
            choice(
                seq("(", ")"),
                seq(
                    "(",
                    seq(
                        $.expr,
                        repeat1(seq($._list_sep, $.expr)),
                        optional($._list_sep)
                    ),
                    ")"
                )
            ),
    },
});

function list(rule, sep) {
    return optional(seq(rule, repeat(seq(sep, rule)), optional(sep)));
}
