#!/usr/bin/env python3
"""
Convert async: false jQuery AJAX calls to async/await pattern.
This processes context_menu.js systematically.
"""

import re
import sys

def find_matching_brace_pos(text, open_brace_pos):
    """Find position of matching closing brace."""
    depth = 0
    i = open_brace_pos
    while i < len(text):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1

def find_matching_paren_pos(text, open_paren_pos):
    """Find position of matching closing paren."""
    depth = 0
    i = open_paren_pos
    while i < len(text):
        if text[i] == '(':
            depth += 1
        elif text[i] == ')':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1

def get_indentation(text, pos):
    """Get indentation of the line containing pos."""
    line_start = text.rfind('\n', 0, pos) + 1
    indent = ''
    i = line_start
    while i < len(text) and text[i] in ' \t':
        indent += text[i]
        i += 1
    return indent

def find_enclosing_function_start(text, pos):
    """
    Find the 'function' keyword that starts the function enclosing pos.
    Returns (func_keyword_pos, func_name, is_async) or None.
    """
    # Search backward from pos for function declarations
    # We look for patterns like:
    # function name(...) {
    # var name = function(...) {
    # name: function(...) {
    # etc.

    # Find all function starts before pos
    best_match = None
    best_brace_start = -1

    for m in re.finditer(r'\bfunction\b', text[:pos]):
        func_pos = m.start()
        # Skip if in a string (rough check)
        # Find the opening { of this function
        # First find the ( after function
        paren_start = text.find('(', func_pos)
        if paren_start == -1 or paren_start > pos:
            continue
        paren_end = find_matching_paren_pos(text, paren_start)
        if paren_end == -1 or paren_end > pos:
            continue
        brace_start = text.find('{', paren_end)
        if brace_start == -1 or brace_start > pos:
            continue
        brace_end = find_matching_brace_pos(text, brace_start)
        if brace_end == -1 or brace_end < pos:
            continue
        # This function contains our position
        if brace_start > best_brace_start:
            best_brace_start = brace_start
            best_match = (func_pos, brace_start, brace_end, m)

    if best_match is None:
        return None

    func_pos, brace_start, brace_end, m = best_match

    # Get function name (if any)
    # Look backward from 'function' for name
    before_func = text[max(0, func_pos-100):func_pos]
    name_match = re.search(r'(\w+)\s*=\s*$', before_func)
    if not name_match:
        name_match = re.search(r'function\s+(\w+)', text[func_pos:func_pos+50])

    # Check if already async
    prefix_start = max(0, func_pos - 20)
    prefix = text[prefix_start:func_pos]
    is_async = bool(re.search(r'\basync\s*$', prefix))

    return func_pos, brace_start, brace_end, is_async

def extract_ajax_call_block(text, async_false_line_pos):
    """
    Find the entire $.ajax({...}); block containing async_false_line_pos.
    Returns (ajax_call_start, ajax_call_end, ajax_body) or None.
    """
    # Search backward for $.ajax(
    search_from = max(0, async_false_line_pos - 5000)
    before = text[search_from:async_false_line_pos]

    # Find the last $.ajax( before our position
    last_ajax = None
    for m in re.finditer(r'\$\.ajax\s*\(', before):
        last_ajax = m

    if last_ajax is None:
        return None

    ajax_call_start = search_from + last_ajax.start()
    after_ajax_paren = search_from + last_ajax.end()

    # Find the opening brace of the options object
    brace_start = text.find('{', after_ajax_paren)
    if brace_start == -1:
        return None

    brace_end = find_matching_brace_pos(text, brace_start)
    if brace_end == -1:
        return None

    # Find the closing paren and semicolon
    after_brace = text[brace_end+1:]
    close_paren_match = re.match(r'\s*\)', after_brace)
    if close_paren_match:
        call_end = brace_end + 1 + close_paren_match.end()
        # Check for semicolon
        semi_match = re.match(r'\s*;', text[call_end:])
        if semi_match:
            call_end += semi_match.end()
    else:
        call_end = brace_end + 1

    ajax_body = text[brace_start:brace_end+1]
    return ajax_call_start, call_end, ajax_body

def parse_ajax_options(ajax_body):
    """Parse options from $.ajax({...}) body."""
    opts = {}

    # Remove the outer braces
    inner = ajax_body[1:-1]

    # Extract url
    m = re.search(r'url\s*:', inner)
    if m:
        opts['url'] = True

    # Extract data
    m = re.search(r'\bdata\s*:', inner)
    if m:
        opts['data'] = True

    # Extract success callback
    success_match = re.search(r'success\s*:\s*function\s*\(([^)]*)\)\s*\{', inner)
    if success_match:
        success_start = success_match.start()
        # Find the function body
        brace_pos = inner.find('{', success_start + success_match.end() - 1)
        if brace_pos != -1:
            brace_end = find_matching_brace_pos(inner, brace_pos)
            if brace_end != -1:
                opts['success_param'] = success_match.group(1).strip()
                opts['success_body'] = inner[brace_pos+1:brace_end].strip()

    # Extract error callback
    error_match = re.search(r'error\s*:\s*function\s*\([^)]*\)\s*\{', inner)
    if error_match:
        error_start = error_match.start()
        brace_pos = inner.find('{', error_start + error_match.end() - 1)
        if brace_pos != -1:
            brace_end = find_matching_brace_pos(inner, brace_pos)
            if brace_end != -1:
                opts['error_body'] = inner[brace_pos+1:brace_end].strip()

    return opts

def build_new_ajax_call(text, ajax_start, ajax_end, ajax_body, indent):
    """Build the replacement async/await ajax call."""
    inner = ajax_body[1:-1]

    # Remove success: function(...) {...},
    # Remove error: function(...) {...},
    # Remove async: false,

    # Get success body and param
    success_body = ''
    success_param = 'data'
    error_body = ''

    success_match = re.search(r',?\s*\bsuccess\s*:\s*function\s*\(([^)]*)\)\s*\{', inner)
    if success_match:
        success_param = success_match.group(1).strip() or 'data'
        brace_pos = inner.find('{', success_match.start() + len(success_match.group()) - 1)
        brace_end = find_matching_brace_pos(inner, brace_pos)
        if brace_end != -1:
            success_body = inner[brace_pos+1:brace_end].strip()

    error_match = re.search(r',?\s*\berror\s*:\s*function\s*\([^)]*\)\s*\{', inner)
    if error_match:
        brace_pos = inner.find('{', error_match.start() + len(error_match.group()) - 1)
        brace_end = find_matching_brace_pos(inner, brace_pos)
        if brace_end != -1:
            error_body = inner[brace_pos+1:brace_end].strip()

    return success_body, error_body, success_param

def remove_from_ajax_options(inner):
    """Remove success, error, async:false from ajax options, return cleaned inner."""
    # Remove async: false,
    inner = re.sub(r',?\s*\basync\s*:\s*false\s*,?', '', inner)

    # Remove success: function(...) {...}
    inner = re.sub(
        r',?\s*\bsuccess\s*:\s*function\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        '',
        inner,
        flags=re.DOTALL
    )

    # Remove error: function(...) {...}
    inner = re.sub(
        r',?\s*\berror\s*:\s*function\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        '',
        inner,
        flags=re.DOTALL
    )

    # Clean up trailing commas
    inner = re.sub(r',(\s*\})', r'\1', inner)

    return inner

def process_simple_pattern(text, ajax_start, ajax_end, ajax_body, var_name, indent):
    """
    Handle: var res; $.ajax({..., async:false, success: fn{res=X;}, error:...}); return res;
    Pattern: result variable assigned in success callback, returned.
    """
    inner = ajax_body[1:-1]

    # Parse success and error
    opts = parse_ajax_options(ajax_body)
    success_body = opts.get('success_body', '')
    error_body = opts.get('error_body', '')
    success_param = opts.get('success_param', 'data')

    # Clean options
    cleaned_inner = remove_from_ajax_options(inner)
    cleaned_ajax = '{' + cleaned_inner + '}'

    return cleaned_ajax, success_body, error_body, success_param

def main():
    filepath = '/home/user/disl_jquery_3-7/js/context_menu.js'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    lines = content.split('\n')

    # Build line-to-pos mapping
    line_pos = [0]
    for line in lines:
        line_pos.append(line_pos[-1] + len(line) + 1)

    # Find all async: false positions
    async_false_positions = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('//') or '/*async' in stripped:
            continue
        if re.search(r'\basync\s*:\s*false', line):
            pos = line_pos[i] + line.find('async')
            async_false_positions.append((i + 1, pos))

    print(f"Found {len(async_false_positions)} async: false occurrences")

    return async_false_positions, content, line_pos, lines

if __name__ == '__main__':
    results = main()
    print("Analysis complete")
