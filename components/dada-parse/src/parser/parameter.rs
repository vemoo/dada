use crate::{parser::Parser, token_test::Identifier};

use dada_ir::{
    code::syntax::op::Op,
    code::syntax::{LocalVariableDeclData, LocalVariableDeclSpan},
    kw::Keyword,
    parameter::Parameter,
    span::Span,
    storage::Atomic,
};

use super::ParseList;

impl<'db> Parser<'db> {
    pub(crate) fn parse_only_parameters(&mut self) -> Vec<Parameter> {
        let p = self.parse_list(true, Parser::parse_parameter);
        self.emit_error_if_more_tokens("extra tokens after parameters");
        p
    }

    fn parse_parameter(&mut self) -> Option<Parameter> {
        let opt_storage_mode = self.parse_atomic();
        if let Some((name_span, name)) = self.eat(Identifier) {
            let opt_ty = if let Some(colon_span) = self.eat_op(Op::Colon) {
                let opt_ty = self.parse_ty();

                if opt_ty.is_none() {
                    self.error_at_current_token(&"expected type after `:`".to_string())
                        .secondary_label(colon_span, "`:` is here".to_string())
                        .emit(self.db);
                }

                opt_ty
            } else {
                None
            };

            let (atomic_span, atomic) = match opt_storage_mode {
                Some(span) => (span, Atomic::Yes),
                None => (name_span, Atomic::No),
            };

            let decl = LocalVariableDeclData {
                atomic,
                name,
                ty: opt_ty,
            };

            let decl_span = LocalVariableDeclSpan {
                atomic_span,
                name_span,
            };

            Some(Parameter::new(self.db, name, decl, decl_span))
        } else {
            // No identifier == no parameter; if there's a storage mode,
            // that's an error.
            if let Some(span) = opt_storage_mode {
                self.error_at_current_token("expected parameter name after `atomic`")
                    .secondary_label(span, "`atomic` specified here")
                    .emit(self.db);
            }

            None
        }
    }

    pub(crate) fn parse_atomic(&mut self) -> Option<Span> {
        if let Some((span, _)) = self.eat(Keyword::Atomic) {
            Some(span)
        } else {
            None
        }
    }
}
