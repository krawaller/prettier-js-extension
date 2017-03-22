(() => {
  const el = document.activeElement;
  const isCodeMirror = el && el.closest('.CodeMirror');
  const isNativeInput = el && el.matches('textarea');

  if (isCodeMirror) {
    const cm = el.closest('.CodeMirror').CodeMirror;
    const mode = cm && cm.getMode().name;
    if (['javascript', 'markdown'].includes(mode)) {
      const hasSelection = cm.getSelection();
      if (hasSelection) {
        cm.replaceSelections(
          cm.getSelections().map(sel => format(sel).trimRight()),
          'around'
        );
      } else {
        const before = cm.getValue();
        const after = format(before);
        if (after !== before) {
          const cursor = cm.getCursor();
          cm.setValue(format(cm.getValue()));
          cm.setCursor(cursor);
        }
      }
    }
  } else if (isNativeInput) {
    const { selectionStart, selectionEnd } = el;
    const hasSelection = selectionStart !== selectionEnd;
    const before = hasSelection
      ? el.value.substring(selectionStart, selectionEnd)
      : el.value;
    const after = format(before);
    if (after !== before) {
      if (hasSelection) {
        document.execCommand('insertText', false, after.trimRight());
        el.setSelectionRange(
          selectionStart,
          selectionStart + after.trimRight().length
        );
      } else {
        el.setSelectionRange(0, el.value.length);
        document.execCommand('insertText', false, after);
        el.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }

  function format(str) {
    // Try formatting Markdown JS Code Blocks
    try {
      str = str.replace(
        /(^\s*```(?:js|jsx|javascript)\s*$[\r\n])([\s\S]*?)(^\s*```)/mig,
        (_, start, code, end) => start + prettier.format(code) + end.trimRight()
      );
    } catch (error) {}
    // Try formatting it all
    try {
      str = prettier.format(str);
    } catch (error) {}
    return str;
  }
})();
