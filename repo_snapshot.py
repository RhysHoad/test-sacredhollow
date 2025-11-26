"""A script to generate a structured snapshot of a repository's file contents."""

import argparse
import os
import sys

# --- Configuration ---
# Specific directories to ignore recursively
EXCLUDED_DIRS = [
    ".git",
    "__pycache__",
    "node_modules",
    "venv",
    "env",
    "dist",
    "build",
    "tmp",
    "log",
    "temp",
    "assets",
    "images"
]
# Specific file names to ignore, regardless of directory
EXCLUDED_FILES = [
    ".DS_Store",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
]
# Max file size in bytes (1MB limit)
MAX_FILE_SIZE = 1024 * 1024
# The name of the file to save the snapshot output to.
SNAPSHOT_FILENAME = "repository_snapshot.txt"


# 🛑 FIX D100: Add module docstring
"""A script to generate a structured snapshot of a repository's file contents."""


def is_part_excluded(path_part):
    # 🛑 FIX D401: Change to imperative mood ("Checks" -> "Check")
    """Check if a path component is in the exclusion lists."""
    stripped_part = path_part.strip()
    return stripped_part in EXCLUDED_DIRS or stripped_part in EXCLUDED_FILES


def should_exclude(path):
    # 🛑 FIX D401: Change to imperative mood ("Checks" -> "Check")
    """Check if a path should be excluded based on directory or file component match."""
    path_parts = path.split(os.sep)
    for part in path_parts:
        if is_part_excluded(part):
            return True
    return False


def format_file_content(full_path, relative_path, output):
    # 🛑 FIX D401: Change to imperative mood ("Handles" -> "Handle")
    """Handle reading a file, checking size, and formatting its content for output."""
    try:
        file_size = os.path.getsize(full_path)
        if file_size > MAX_FILE_SIZE:
            output.append(f"---FILESTART:{relative_path}---\n")
            output.append(f"[File toolarge({file_size/1024:.2f}KB) or binary-Content Skipped]\n")
            output.append(f"---FILEEND:{relative_path}---\n\n")
            return

        # Attempt to read the file content
        with open(full_path, encoding="utf-8") as f:
            content = f.read()

        output.append(f"---FILESTART:{relative_path}---\n")
        # Ensure the content is stripped of leading/trailing whitespace but ends with a newline
        content_stripped = content.strip()
        if content_stripped:
            output.append(content_stripped + "\n")
        else:
            output.append("\n")  # Keep empty files empty lines
        output.append(f"---FILEEND:{relative_path}---\n\n")

    except UnicodeDecodeError:
        output.append(f"---FILESTART:{relative_path}---\n")
        output.append("[Binary file or non-UTF-8 encoding - Content Skipped]\n")
        output.append(f"---FILEEND:{relative_path}---\n\n")
    except Exception as e:
        output.append(f"---FILESTART:{relative_path}---\n")
        output.append(f"[Error reading file: {e}]\n")
        output.append(f"---FILEEND:{relative_path}---\n\n")


def generate_snapshot(root_dir, script_path, output_filename):
    # 🛑 FIX D205: Insert blank line between summary and description
    """Traverse the directory structure and generate a structured snapshot string.

    This function was simplified to pass complexity checks (C901, PLR0912, PLR0915).
    """
    output = []
    root_dir = os.path.abspath(root_dir)
    script_path = os.path.abspath(script_path)
    snapshot_output_path = os.path.abspath(os.path.join(root_dir, output_filename))

    # 🛑 FIX (PLR1714): Use a set for efficient comparison
    special_paths = {script_path, snapshot_output_path}

    output.append(f"========REPOSITORYSNAPSHOTSTART({root_dir})========\n")
    dir_list = []

    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=True):
        # 1. Exclude directories in-place for os.walk
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]

        relative_dirpath = os.path.relpath(dirpath, root_dir)

        # Append directory listing
        if relative_dirpath == ".":
            dir_list.append("---DIRECTORY:/---\n")
        elif not should_exclude(relative_dirpath):
            dir_list.append(f"---DIRECTORY:{relative_dirpath}{os.sep}---\n")

        # 2. Process files
        for filename in sorted(filenames):
            # Check for file exclusion by name
            if filename.strip() in EXCLUDED_FILES:
                continue

            full_path = os.path.join(dirpath, filename)
            relative_path = os.path.relpath(full_path, root_dir)

            # 🛑 FIX (PLR1714): Efficiently skip the snapshot script and output file
            if full_path in special_paths:
                continue

            if should_exclude(relative_path):
                continue

            format_file_content(full_path, relative_path, output)

    output.append(f"========REPOSITORYSNAPSHOTEND({root_dir})========\n")

    # Combine directory list and file content snapshot
    full_content = "".join(dir_list) + "\n" + "".join(output)
    return full_content


if __name__ == "__main__":
    """Main execution block for generating the repository snapshot file."""
    parser = argparse.ArgumentParser(
        description="Generate a structured snapshot of a directory for AI consumption.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "path",
        nargs="?",  # Makes the path argument optional
        default=".",  # Defaults to the current directory
        help="The root directory to scan (e.g., '.'). Defaults to current directory.",
    )
    args = parser.parse_args()

    # Get the path to the running script itself
    script_file_path = os.path.abspath(sys.argv[0])

    try:
        # 1. Generate the snapshot content string
        snapshot_content = generate_snapshot(args.path, script_file_path, SNAPSHOT_FILENAME)

        # 2. Determine the full output path
        output_filepath = os.path.join(args.path, SNAPSHOT_FILENAME)

        # 3. Write the content to the file, overwriting existing content (mode 'w')
        with open(output_filepath, "w", encoding="utf-8") as f:
            f.write(snapshot_content)

        print("Successfully generated repository snapshot.")
        print(f"Output saved to: {os.path.abspath(output_filepath)}")

    except FileNotFoundError:
        print(f"Error: Directory '{args.path}' not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)
