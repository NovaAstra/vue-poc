export default function (RED) {
  // 1毫秒
  var MILLIS_TO_NANOS = 1000000;
  // 1秒
  var SECONDS_TO_NANOS = 1000000000;

  function DelayNode(n) {
    var node = this;

    function ourTimeout(handler, delay, clearHandler) {
      var toutID = setTimeout(handler, delay);
      return {
        clear: function () { clearTimeout(toutID); clearHandler(); },
        trigger: function () { clearTimeout(toutID); return handler(); }
      };
    }

    // n.timeout 配置为秒需要转换为毫秒, 时间类型
    if (n.timeoutUnits === 'minutes') {
      this.timeout = n.timeout * (60 * 1000);
    } else {
      // Default to seconds
      this.timeout = n.timeout * 1000;
    }

    if (n.rateUnits === "minute") {

      this.rate = (60 * 1000) / n.rate;
    } else {
      // Default to seconds
      this.rate = 1000 / n.rate;
    }

    if (node.pauseType === "delay") {
      node.on("input", function (msg, send, done) {
        var id = ourTimeout(function () {
          send(msg);
          done();
        }, node.timeout, () => done());
      })
    }
  }
}