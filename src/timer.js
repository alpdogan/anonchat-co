function timer(fn) {
  var countDownDate = new Date().getTime() + 20 * 60 * 1000;

  var x = setInterval(function () {
    var now = new Date().getTime();

    var distance = countDownDate - now;

    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("timer").innerHTML = minutes + "m " + seconds + "s ";
    if (distance < 0) {
      // timer has expired
      clearInterval(x);
      fn();
    }
  }, 1000);
  return {
    ref: x,
  };
}
module.exports = timer;
