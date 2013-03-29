# processee

Enjoy some CoffeeScript in your Processing.

## What?

`processee` is an environment that lets you create graphics using code.
It is based on the CoffeeScript programming language and the Processing graphics library.
However, it's more than just a wrapper over Processing - the API has been redesigned to be easier to learn and use.
As Bret Victor pointed out in his essay [Learnable Programming](http://worrydream.com/LearnableProgramming/),
Processing has some problems.
`processee` aims to fix, or at least alleviate, some of the major ones:

 * **Dependence on invisible global state** makes understanding and sharing code difficult.
   `processee` lets you draw in blocks with their own state that does not 'leak' out.
   This takes care of the canonical-state boilerplate code and enables painless _recomposition_.
   
 * **Hard-to-read syntax** makes Processing difficult to learn without constantly diving into the reference manual.
   `processee` provides functions that take configuration objects with named parameters for clarity.
   Of course, you can still use the original, terse functions.
   
 * **Unnatural naming convention** where verbs like `fill` perform no visible actions, but nouns like `rect` do.
   `processee` aims to provide a coherent and natural language in its API that lets you intuitively
   understand what code will do before you run it.

##Interested?

[Check out the demo](http://eightyeight.github.com/processee/#flower).

## Made with

 * [CoffeeScript](http://coffeescript.org)
 * [Processing.js](http://processingjs.org/)
 * [CodeMirror](http://codemirror.net/)
