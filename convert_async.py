#!/usr/bin/env python3
"""
Convert async: false jQuery AJAX calls to async/await pattern.
This script processes context_menu.js and transforms synchronous AJAX patterns
to modern async/await.
"""

import re
import sys

def find_matching_brace(text, start):
    """Find the position of the closing brace matching the opening brace at start."""
    count = 0
    i = start
    while i < len(text):
        if text[i] == '{':
            count += 1
        elif text[i] == '}':
            count -= 1
            if count == 0:
                return i
        i += 1
    return -1

def find_ajax_block(text, async_false_pos):
    """Find the start and end of the $.ajax({...}) block containing async: false."""
    # Search backward for $.ajax(
    search_start = max(0, async_false_pos - 2000)
    before = text[search_start:async_false_pos]

    # Find the last $.ajax( before async: false
    ajax_match = None
    for m in re.finditer(r'\$\.ajax\s*\(', before):
        ajax_match = m

    if ajax_match is None:
        return None, None

    ajax_start = search_start + ajax_match.start()
    # Find the opening { after $.ajax(
    paren_pos = ajax_start + ajax_match.end() - ajax_match.start()
    # Find the {
    brace_start = text.find('{', ajax_start + len(ajax_match.group()))
    if brace_start == -1:
        return None, None

    brace_end = find_matching_brace(text, brace_start)
    if brace_end == -1:
        return None, None

    # Check the closing paren
    close_paren = text.find(')', brace_end)
    if close_paren == -1:
        return None, None

    return ajax_start, close_paren + 1

def extract_ajax_properties(ajax_body):
    """Extract url, type, dataType, data, success callback, error callback from ajax body."""
    props = {}

    # Extract url
    url_match = re.search(r"url\s*:\s*'([^']*)'", ajax_body)
    if not url_match:
        url_match = re.search(r'url\s*:\s*"([^"]*)"', ajax_body)
    if url_match:
        props['url'] = url_match.group(0)

    return props

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all lines with async: false (not commented out)
    lines = content.split('\n')

    async_false_lines = []
    for i, line in enumerate(lines):
        # Skip commented lines
        stripped = line.strip()
        if stripped.startswith('//') or stripped.startswith('/*') or '/*async' in stripped:
            continue
        if re.search(r'async\s*:\s*false', line):
            async_false_lines.append(i + 1)  # 1-indexed

    print(f"Found {len(async_false_lines)} async: false occurrences to convert")
    print(f"Lines: {async_false_lines[:20]}...")

    return async_false_lines

if __name__ == '__main__':
    lines = process_file('/home/user/disl_jquery_3-7/js/context_menu.js')
    print(f"\nTotal: {len(lines)}")
