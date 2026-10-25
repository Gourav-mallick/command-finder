# Local command formats

JSON file shape is `{ "commands": [ ... ] }`. Each command requires `id`, `name`, `command`, `description`, `category`, `tags`, `examples`, `platforms`, and `risk`. Platforms are `linux`, `windows`, `macos`, or `all`; risk is `low`, `medium`, or `high`. Files are limited to 1 MiB and 2,000 records per JSON file.

TXT files contain one command per non-empty line. A line beginning with `#` after whitespace is ignored. No multiline continuation or metadata syntax is supported in TXT; use JSON for richer entries.
