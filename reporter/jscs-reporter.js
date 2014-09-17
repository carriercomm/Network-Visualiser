var clc = require('cli-color');

module.exports = function(errorsCollection) {
  var errorCount = 0;

  var fileName = clc.xterm(24);

  var report = errorsCollection.map(function(errors) {
    if (!errors.isEmpty()) {
       process.stdout.write('\n' + fileName(errors.getFilename()));
      var error;
      errorCount += errors.getErrorCount();
      var errorList = errors.getErrorList();
      for (var i in errorList) {
        error = errorList[i];
         process.stdout.write('\n\t' + error.line + ', ' + error.column + ' - '  + error.message);
      }
    }
    return '';
  });

  if (errorCount) {
     process.stdout.write('\n' + clc.red(errorCount + ' error(s) found.'  + '\n'));
  } else {
     process.stdout.write(clc.green('No code style errors found.'  + '\n'));
  } 

}
