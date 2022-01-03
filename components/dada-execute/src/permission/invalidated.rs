use crossbeam::atomic::AtomicCell;
use dada_ir::{diagnostic::Fallible, error};

use crate::{interpreter::Interpreter, moment::Moment};

#[derive(Default)]
pub(super) struct Invalidated {
    /// Has this permision been canceled? (if so, when)
    invalidated: AtomicCell<Option<Moment>>,
}

impl Invalidated {
    pub(super) fn invalidate(&self, interpreter: &Interpreter<'_>, moment: Moment) -> Fallible<()> {
        self.check_still_valid(interpreter, moment)?;
        self.invalidated.store(Some(moment));
        Ok(())
    }

    pub(super) fn check_still_valid(
        &self,
        interpreter: &Interpreter<'_>,
        moment: Moment,
    ) -> Fallible<()> {
        if let Some(previous_moment) = self.invalidated.load() {
            let span_now = interpreter.span(moment);
            let span_then = interpreter.span(previous_moment);
            return Err(error!(span_now, "permission already given")
                .label(span_then, "permission given here")
                .emit(interpreter.db()));
        }
        Ok(())
    }
}