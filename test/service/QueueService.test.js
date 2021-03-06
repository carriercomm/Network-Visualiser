/*jshint expr: true*/
/*jshint unused:false*/

var QueueService = require('../../backend/maidsafe/service/QueueService');
var should = require('should');

describe('QueueService', function() {
  it('QueueService - Should be able to put log into the queue and also clean up the Queue', function(done) {
    var log = { sessionId: 'e279ed56-6657-418f-eda1-9012c23a8165',
      actionId: 0,
      vaultId: 'asd..ghghgfzc',
      valueOne: 'sd',
      ts: '2014-10-10 03:32:09.350'
    };
    var handleIncomingLog = function(logReceived, callBack) {
      logReceived.should.be.eql(log);
      callBack();
      QueueService.deleteQueue(log.sessionId).should.be.ok;
      QueueService.subscribe(null);
      done();
    };
    QueueService.subscribe(handleIncomingLog);
    QueueService.pushToQueue(log);
  });
});
