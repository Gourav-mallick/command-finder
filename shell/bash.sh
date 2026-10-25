# Source this file from ~/.bashrc. CMDX prints only the selected command to stdout.
__cmdx_pick() {
  local selected status before cursor
  before=${READLINE_LINE-}
  cursor=${READLINE_POINT:-${#before}}
  selected=$(command cmdx --pick)
  status=$?
  if (( status != 0 )); then
    READLINE_LINE=$before
    READLINE_POINT=$cursor
    return 0
  fi
  READLINE_LINE="${before:0:cursor}${selected}${before:cursor}"
  READLINE_POINT=$((cursor + ${#selected}))
}
if [[ $- == *i* ]]; then bind -x '"\C-g":__cmdx_pick'; fi
