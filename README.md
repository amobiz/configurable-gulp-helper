# gulp-ccr-stream-helper

Stream helper functions for cascading configurable gulp recipes for [gulp-chef](https://github.com/gulp-cookery/gulp-chef).

## Install

``` bash
$ npm install --save gulp-ccr-stream-helper
```

## API

### helper(name): object

Initializes and returns an helper object with `prerequisite()` and `runTask()` method.

##### name

The name will show up in error message.

#### helper.prerequisite(context, upstream, minTasks)

Check if runtime context fulfilled.

##### context: object

Context of the caller. Always pass `this` here.

##### upstream: boolean

Does this task / stream processor support upstream, i.e. can be piped to? False if not.
Throws if not fulfilled.

##### minTasks: integer

Optional. How many sub task must be provided at minimum? Default to 1.
Throws if not fulfilled.

Number of 0 means this stream processor can be used as a normal task.


#### helper.runTask(context, task): stream

Call task with given context and checks:

1. Does the task return a stream? Throws if not.
2. Does the task try to call the "`done()`" callback? Throws if it does.

##### context

The context to call task.

##### task

The task to run.

## Example

``` javascript
var helper = require('gulp-ccr-stream-helper')('My Stream Processor');

module.exports = function () {
    var gulp = this.gulp;
    var tasks = this.tasks;
    var context, stream, i;

    helper.prerequisite(this, true, 2);

    context = {
        gulp: gulp,
        config: {}
    };

    stream = this.upstream;
    for (i = 0; i < tasks.length; ++i) {
        context.upstream = stream;
        stream = helper.runTask(context, tasks[i]);
    }
    return stream;
};
module.exports.type = 'stream';
```

## License
[MIT](https://opensource.org/licenses/MIT)

## Author
[Amobiz](https://github.com/amobiz)
