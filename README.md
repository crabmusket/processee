# processee

Enjoy some CoffeeScript in your Processing.

## What?

Processee is an environment that lets you create graphics using code.
It is based on the CoffeeScript programming language and the Processing graphics library.
However, it's more than just a wrapper over Processing - the API has been redesigned to be easier to learn and use.
As Bret Victor pointed out in his essay [Learnable Programming](http://worrydream.com/LearnableProgramming/),
Processing has some problems.
Processee aims to fix, or at least alleviate, some of the major ones:

 * **Dependence on invisible global state** makes understanding and sharing code difficult.
   Processee lets you draw in blocks with their own state that does not 'leak' out.
   This takes care of the canonical-state boilerplate code and enables painless _recomposition_.
   
 * **Hard-to-read syntax** makes Processing difficult to learn without constantly diving into the reference manual.
   Processee provides functions that take configuration objects with named parameters for clarity.
   
 * **Unnatural naming convention** where verbs like `fill` perform no visible actions, but nouns like `rect` do.
   Processee aims to provide a coherent and natural language in its API that lets you intuitively
   understand what code will do before you run it.

## Interested?

Check out the [demo][] or have a read through the [tutorial][].

 [demo]: http://eightyeight.github.com/processee/#flower
 [tutorial]: https://github.com/eightyeight/processee/wiki/Getting-started

## Made with

 * [CoffeeScript](http://coffeescript.org)
 * [Processing.js](http://processingjs.org/)
 * [CodeMirror](http://codemirror.net/)
 * [jQuery](http://jquery.org)
 * [PICOL](http://www.picol.org/index.php)
 * [FileSaver.js](https://github.com/eligrey/FileSaver.js)
