#![feature(trait_upcasting)]
#![feature(let_else)]
#![allow(incomplete_features)]
#![allow(clippy::manual_map)]

mod code_parser;
mod file_parser;
mod parameter_parser;
mod parser;
mod token_test;
mod tokens;

#[salsa::jar(db = Db)]
pub struct Jar(
    code_parser::parse_function_body,
    file_parser::parse_file,
    parameter_parser::parse_function_parameters,
    parameter_parser::parse_class_parameters,
);

pub trait Db: salsa::DbWithJar<Jar> + dada_lex::Db + dada_ir::Db {}
impl<T> Db for T where T: salsa::DbWithJar<Jar> + dada_lex::Db + dada_ir::Db {}

pub mod prelude;

pub fn grammar_diagnostics(
    db: &dyn Db,
    input_file: dada_ir::input_file::InputFile,
) -> Vec<dada_ir::diagnostic::Diagnostic> {
    let mut diags =
        file_parser::parse_file::accumulated::<dada_ir::diagnostic::Diagnostics>(db, input_file);
    // to get all grammar diagnostics we need to visit each item, because `parse_file`
    // leaves some parts unparsed, as `TokenTree`s
    let source_file = file_parser::parse_file(db, input_file);
    for item in source_file.items(db) {
        match item {
            dada_ir::item::Item::Function(func) => {
                diags.extend(code_parser::parse_function_body::accumulated::<
                    dada_ir::diagnostic::Diagnostics,
                >(db, *func));
            }
            dada_ir::item::Item::Class(class) => {
                diags.extend(parameter_parser::parse_class_parameters::accumulated::<
                    dada_ir::diagnostic::Diagnostics,
                >(db, *class));
            }
        }
    }
    diags
}
