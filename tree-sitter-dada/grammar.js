/// <reference path="./node_modules/tree-sitter-cli/dsl.d.ts" />

const BinaryOps = [
    { ops: ["+=", "-=", "/=", "*=", ":="], prec: 6 },
    { ops: ["==", "<", ">", "<=", ">="], prec: 5 },
    { ops: ["+", "-"], prec: 4 },
    { ops: ["/", "*"], prec: 3 },
];

module.exports = grammar({
    name: "dada",
    word: ($) => $.identifier,
    extras: ($) => [$.comment, /\s/],
    rules: {
        source_file: ($) => repeat(choice($.item, $.expr)),
        comment: () => seq("#", /[^\n]*/),
        _list_sep: () => choice(",", "\n"),
        item: ($) => choice($.class, $.function),
        atomic: () => "atomic",
        _parameter_or_variable: ($) => seq(optional($.atomic), $.identifier),
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
                "{",
                list($.expr, $._list_sep),
                "}"
            ),
        expr: ($) =>
            choice(
                $.variable_declaration,
                $.return,
                $.identifier,
                $.literal_integer,
                $.literal_float,
                $.literal_boolean,
                $.format_string,
                $.binary_op
            ),
        identifier: () => /[A-Za-z_][A-Za-z0-9_]*/,
        variable_declaration: ($) => seq($._parameter_or_variable, "=", $.expr),
        return: ($) => prec.left(seq("return", optional($.expr))),
        _number: () => /[0-9][0-9_]*/,
        literal_integer: ($) => $._number,
        literal_float: ($) => seq($._number, ".", $._number),
        literal_boolean: () => choice("true", "false"),
        format_string: ($) =>
            seq(
                '"',
                repeat(choice(/\\./, /[^"{\\]+/, seq("{", $.expr, "}"))),
                '"'
            ),
        binary_op: ($) =>
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
    },
});

function list(rule, sep) {
    return optional(seq(rule, repeat(seq(sep, rule)), optional(sep)));
}
