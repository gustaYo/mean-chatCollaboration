(function() {
    timer = {}
})();

(function(e) {
    function t(e) {
        return document.getElementById(e)
    }
    function s(e) {
        this.e_timer = t(e);
        this.restart()
    }
    var n = 0, r, i;
    s.prototype.now = function() {
        return(new Date).getTime()
    };
    s.prototype.restart = function() {
        r = i = this.now();
        this.startTime()
    };
    s.prototype.addTime = function(e) {
        if (typeof e == "number") {
            r -= Math.abs(e)
        }
    };
    s.prototype.startTime = function() {
        var e = this;
        this.uuid = n;
        (function() {
            if (e.uuid == n) {
                var t = i = e.now();
                e.e_timer.innerHTML = e.time();
                setTimeout(arguments.callee, 1e3)
            }
        })()
    };
    s.prototype.stop = function() {
        ++n
    };
    s.prototype.getTime = function() {
        return i - r
    };
    s.prototype.time = function() {
        var e = ~~((i - r) / 1e3), t = e % 60, n = ~~(e / 60), s = ~~(n / 60);
        n %= 60;
        return(s > 9 ? s : "0" + s) + ":" + (n > 9 ? n : "0" + n % 60) + ":" + (t > 9 ? t : "0" + t)
    };
    e.Timer = s
})(timer);
