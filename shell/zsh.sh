# Source from ~/.zshrc. CMDX prints only the selected command to stdout.
function __cmdx_pick_widget() {
  local selected
  selected=$(command cmdx --pick) || return 0
  LBUFFER+="$selected"
}
zle -N __cmdx_pick_widget
bindkey '^G' __cmdx_pick_widget
