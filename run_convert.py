#!/usr/bin/env python3
"""Convert async:false jQuery AJAX calls to async/await in context_menu.js."""

import re, shutil

FILEPATH = '/home/user/disl_jquery_3-7/js/context_menu.js'

def find_match(text, start, open_ch, close_ch):
    depth = 0
    for i in range(start, len(text)):
        if text[i] == open_ch:
            depth += 1
        elif text[i] == close_ch:
            depth -= 1
            if depth == 0:
                return i
    return -1

def get_indent(text, pos):
    ls = text.rfind('\n', 0, pos) + 1
    i = ls
    while i < pos and text[i] in ' \t':
        i += 1
    return text[ls:i]

def find_ajax_block(text, async_pos):
    """Find $.ajax({...}); block containing async_pos. Returns (start, end, opts_inner) or None."""
    search_from = max(0, async_pos - 4000)
    segment = text[search_from:async_pos]
    last = None
    for m in re.finditer(r'\$\.ajax\s*\(', segment):
        last = m
    if last is None:
        return None

    ajax_start = search_from + last.start()
    after_paren = search_from + last.end()

    p = after_paren
    while p < len(text) and text[p] in ' \t\n':
        p += 1
    if p >= len(text) or text[p] != '{':
        return None

    opts_start = p
    opts_end = find_match(text, opts_start, '{', '}')
    if opts_end == -1:
        return None

    end = opts_end + 1
    while end < len(text) and text[end] in ' \t\n':
        end += 1
    if end < len(text) and text[end] == ')':
        end += 1
    if end < len(text) and text[end] == ';':
        end += 1

    return ajax_start, end, text[opts_start+1:opts_end]

def extract_fn_body(text, fn_kw_end):
    """Extract (first_param, body_str, end_pos) from function(p){body}."""
    p = fn_kw_end
    while p < len(text) and text[p] in ' \t\n':
        p += 1
    if p >= len(text) or text[p] != '(':
        return None, None, None
    pe = find_match(text, p, '(', ')')
    if pe == -1:
        return None, None, None
    first_param = text[p+1:pe].split(',')[0].strip() or 'data'
    p2 = pe + 1
    while p2 < len(text) and text[p2] in ' \t\n':
        p2 += 1
    if p2 >= len(text) or text[p2] != '{':
        return None, None, None
    be = find_match(text, p2, '{', '}')
    if be == -1:
        return None, None, None
    return first_param, text[p2+1:be].strip(), be + 1

def compact(s):
    """Collapse whitespace into single spaces."""
    return ' '.join(s.split())

def parse_opts(inner):
    """
    Extract success/error callbacks and return
    (clean_inner_compact, success_param, success_body, error_body).
    """
    success_param = success_body = error_body = None
    sm_span = em_span = None

    # success callback
    sm = re.search(r',?\s*\bsuccess\s*:\s*function\b', inner)
    if sm:
        sp, sb, se = extract_fn_body(inner, sm.end())
        if sb is not None:
            success_param, success_body = sp, sb
            sm_span = (sm.start(), se)

    # error callback
    em = re.search(r',?\s*\berror\s*:\s*function\b', inner)
    if em:
        _, eb, ee = extract_fn_body(inner, em.end())
        if eb is not None:
            error_body = eb
            em_span = (em.start(), ee)

    # Remove async:false, success, error from inner
    spans = []
    for m in re.finditer(r',?\s*\basync\s*:\s*false\b\s*,?', inner):
        spans.append((m.start(), m.end()))
    if sm_span:
        spans.append(sm_span)
    if em_span:
        spans.append(em_span)

    spans.sort(key=lambda x: x[0], reverse=True)
    clean = inner
    for s, e in spans:
        clean = clean[:s] + clean[e:]

    # Tidy up stray commas
    clean = re.sub(r',\s*,', ',', clean)
    clean = re.sub(r',(\s*)$', r'\1', clean)
    clean = clean.strip().strip(',').strip()

    return compact(clean), success_param or 'data', success_body, error_body

def indent_block(text, indent):
    """Re-indent a multi-line block."""
    lines = text.split('\n')
    result = []
    for ln in lines:
        stripped = ln.strip()
        if stripped:
            result.append(indent + stripped)
        else:
            result.append('')
    return '\n'.join(result)

def has_direct_await(body):
    """True if body contains 'await' at top level (not inside nested function)."""
    i = 0
    while i < len(body):
        if body[i:i+8] == 'function':
            # skip nested function body
            p = body.find('(', i+8)
            if p != -1:
                pe = find_match(body, p, '(', ')')
                if pe != -1:
                    bs = body.find('{', pe)
                    if bs != -1:
                        be = find_match(body, bs, '{', '}')
                        if be != -1:
                            i = be + 1
                            continue
            i += 8
        elif body[i:i+5] == 'await' and (i == 0 or not body[i-1].isalnum()):
            return True
        else:
            i += 1
    return False

def main():
    shutil.copy(FILEPATH, FILEPATH + '.bak')
    print(f"Backup: {FILEPATH}.bak")

    with open(FILEPATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Collect async:false character positions (skip comments)
    lines = content.split('\n')
    positions = []
    offset = 0
    for line in lines:
        s = line.strip()
        if not s.startswith('//') and '/*async' not in s:
            m = re.search(r'async\s*:\s*false', line)
            if m:
                positions.append(offset + m.start())
        offset += len(line) + 1

    print(f"Found {len(positions)} async:false occurrences")

    converted = skipped = 0

    # Process end → start so positions stay valid
    for async_pos in reversed(positions):
        block = find_ajax_block(content, async_pos)
        if block is None:
            print(f"  SKIP pos={async_pos}: no $.ajax block found")
            skipped += 1
            continue

        ajax_start, ajax_end, opts_inner = block
        clean_opts, sp, success_body, error_body = parse_opts(opts_inner)
        indent = get_indent(content, ajax_start)
        ii = indent + '    '

        if success_body:
            sb = indent_block(success_body, ii)
            eb = indent_block(error_body, ii) if error_body else ''
            repl = (
                f"{indent}try {{\n"
                f"{ii}var {sp} = await $.ajax({{{clean_opts}}});\n"
                f"{sb}\n"
                f"{indent}}} catch(e) {{\n"
                f"{eb}\n"
                f"{indent}}}"
            )
        else:
            eb = indent_block(error_body, ii) if error_body else ''
            repl = (
                f"{indent}try {{\n"
                f"{ii}await $.ajax({{{clean_opts}}});\n"
                f"{indent}}} catch(e) {{\n"
                f"{eb}\n"
                f"{indent}}}"
            )

        content = content[:ajax_start] + repl + content[ajax_end:]
        converted += 1

    print(f"Pass 1 done — converted: {converted}, skipped: {skipped}")

    # Pass 2: make functions containing top-level 'await' async
    async_added = 0
    fns = list(re.finditer(r'\bfunction\b', content))
    for m in reversed(fns):
        fp = m.start()
        prefix = content[max(0, fp-25):fp]
        if re.search(r'\basync\s*$', prefix.rstrip()):
            continue
        p = content.find('(', fp)
        if p == -1:
            continue
        pe = find_match(content, p, '(', ')')
        if pe == -1:
            continue
        bs = content.find('{', pe)
        if bs == -1:
            continue
        be = find_match(content, bs, '{', '}')
        if be == -1:
            continue
        if has_direct_await(content[bs+1:be]):
            content = content[:fp] + 'async ' + content[fp:]
            async_added += 1

    print(f"Pass 2 done — made {async_added} functions async")

    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.write(content)

    # Count remaining
    remaining = sum(
        1 for line in content.split('\n')
        if not line.strip().startswith('//')
        and '/*async' not in line
        and re.search(r'async\s*:\s*false', line)
    )
    print(f"Remaining async:false (active): {remaining}")
    print("Done!")

if __name__ == '__main__':
    main()
