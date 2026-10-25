# Source from ~/.config/fish/config.fish.
function __cmdx_pick
    set -l selected (command cmdx --pick | string collect)
    set -l status_code $pipestatus[1]
    if test $status_code -ne 0
        return
    end
    commandline -i -- $selected
end
bind \cg __cmdx_pick
