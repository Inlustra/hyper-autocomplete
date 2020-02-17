# Hyper Autocomplete

Entirely inspired by the now deprecated [Upterm!](https://github.com/railsware/upterm), 
Hyper Autocomplete attempts to replicate some of the behavior to provide richer autocomplete
based on the directory and context.

#### It currently offers no actual autocompletion, only suggestions that you can't click on...

*It is still not considered anywhere near production ready and is currently only working (Sort of) on my system.*
*Tested on Mac OS and ZSH*

## Examples

![Git Autocompletion](https://github.com/inlustra/hyper-autocomplete/raw/master/images/example.gif "File Autcompletion")


## TODO

* ACTUALLY autcomplete (Currently just provides examples)
* Speed up icons autocompletion
  * Easy to do by using the SET_CWD action and building file list at that point (Think recursive)
* Add scoring to the autocompletion
  * Score based on history
  * Score based on general most-used commands
* Add maaaaaany missing autocompletions (Currently provides git and file autocomplete, sort of...)
* Fix up the command listening
  * Handle missing commands
    * Delete next word
    * etc...