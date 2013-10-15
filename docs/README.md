# Developer Documentation 

See the [overview](OVERVIEW.md) for a quick overview of the project layout and structure. Additional high-level project documentation should be added to the [wiki](http://github.com/Harvard-ATG/HarmonyLab/wiki). 

### Python Code

Python code should be minimally documented using standard documentation strings described in [PEP8](http://www.python.org/dev/peps/pep-0008/#documentation-strings).

### Javascript Code

Javascript code should be documented using [JSDoc](http://usejsdoc.org/) syntax. 

To generate javascript docs from jsdoc blocks:

```sh
npm install -g git://github.com/jsdoc3/jsdoc.git
cd harmony
jsdoc -c docs/jsdoc/conf.json
```
Every method should have a free-form description of the purpose of the method and tags to document the parameters, return values, exceptions thrown, and events fired (if any): 

-	**@param** {type} 
-	**@return** {type}
-	**@throws** {type} Will throw exception when...
-	**@fires** eventName

The *type* should be one of the basic javascript types. If a method does not return an explicit value (i.e. the method is called for its side-effects and not its return value), then it should be documented as **@return undefined**.

Use the **@constructor** tag to document javascript functions that should be used with the *new* keyword. 

Use the **@todo** tag on methods and classes for tasks that need to be done.
