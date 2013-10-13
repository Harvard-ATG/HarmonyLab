# Documentation 

### Project

High-level project documentation should be in the [wiki](http://github.com/Harvard-ATG/HarmonyLab/wiki). 

### Code 

Python code should be documented using standard documentation strings described in [PEP8](http://www.python.org/dev/peps/pep-0008/#documentation-strings).

Javascript code should be documented using [JSDoc](http://usejsdoc.org/) syntax. 

To generate javascript docs from jsdoc blocks:

```sh
npm install -g git://github.com/jsdoc3/jsdoc.git
cd harmony
jsdoc -c docs/jsdoc/conf.json
```

#### Methods

Every object method should at least use the following tags to document the function name, parameters, and return value along with a general description of the method and its purpose.

-	**@method**
-	**@param** {<type>} 
-	**@return** {<type>}

The type should be one of: {string|number|boolean|function|object|array|undefined}. If a method does not return an explicit value (i.e. the method is called for its side-effects and not its return value), then it should be documented as **@return {undefined}**.

If the method throws an exception it must include the **@throws** tag

#### Classes

To document a class, use the **constructor** tag on the javascript constructor function that is intended to be used with the *new* keyword.


### Miscellaneous

Use the **@todo** tag on methods and classes for tasks that need to be done.
