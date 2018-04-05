/* eslint-disable */
var createObject = Object.create;
function createMap() {
    var map = createObject(null);
    map["__"] = undefined;
    delete map["__"];
    return map;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNuQyxNQUFNO0lBQ0osTUFBTSxHQUFHLEdBQXFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ3RCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pCLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY3JlYXRlT2JqZWN0ID0gT2JqZWN0LmNyZWF0ZTtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXA8VD4oKSB7XG4gIGNvbnN0IG1hcDogeyBba2V5OiBzdHJpbmddOiBUIHwgdW5kZWZpbmVkIH0gPSBjcmVhdGVPYmplY3QobnVsbCk7XG4gIG1hcFtcIl9fXCJdID0gdW5kZWZpbmVkO1xuICBkZWxldGUgbWFwW1wiX19cIl07XG4gIHJldHVybiBtYXA7XG59XG4iXX0=

var Target = function Target(path, matcher, delegate) {
    this.path = path;
    this.matcher = matcher;
    this.delegate = delegate;
};
Target.prototype.to = function to (target, callback) {
    var delegate = this.delegate;
    if (delegate && delegate.willAddRoute) {
        target = delegate.willAddRoute(this.matcher.target, target);
    }
    this.matcher.add(this.path, target);
    if (callback) {
        if (callback.length === 0) {
            throw new Error("You must have an argument in the function passed to `to`");
        }
        this.matcher.addChild(this.path, target, callback, this.delegate);
    }
};
var Matcher = function Matcher(target) {
    this.routes = createMap();
    this.children = createMap();
    this.target = target;
};
Matcher.prototype.add = function add (path, target) {
    this.routes[path] = target;
};
Matcher.prototype.addChild = function addChild (path, target, callback, delegate) {
    var matcher = new Matcher(target);
    this.children[path] = matcher;
    var match = generateMatch(path, matcher, delegate);
    if (delegate && delegate.contextEntered) {
        delegate.contextEntered(target, match);
    }
    callback(match);
};
function generateMatch(startingPath, matcher, delegate) {
    function match(path, callback) {
        var fullPath = startingPath + path;
        if (callback) {
            callback(generateMatch(fullPath, matcher, delegate));
        }
        else {
            return new Target(fullPath, matcher, delegate);
        }
    }
    
    return match;
}
function addRoute(routeArray, path, handler) {
    var len = 0;
    for (var i = 0; i < routeArray.length; i++) {
        len += routeArray[i].path.length;
    }
    path = path.substr(len);
    var route = { path: path, handler: handler };
    routeArray.push(route);
}
function eachRoute(baseRoute, matcher, callback, binding) {
    var routes = matcher.routes;
    var paths = Object.keys(routes);
    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var routeArray = baseRoute.slice();
        addRoute(routeArray, path, routes[path]);
        var nested = matcher.children[path];
        if (nested) {
            eachRoute(routeArray, nested, callback, binding);
        }
        else {
            callback.call(binding, routeArray);
        }
    }
}
var map = function (callback, addRouteCallback) {
    var matcher = new Matcher();
    callback(generateMatch("", matcher, this.delegate));
    eachRoute([], matcher, function (routes) {
        if (addRouteCallback) {
            addRouteCallback(this, routes);
        }
        else {
            this.add(routes);
        }
    }, this);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZHNsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFpQ25DO0lBS0UsWUFBWSxJQUFZLEVBQUUsT0FBZ0IsRUFBRSxRQUE4QjtRQUN4RSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRUQsRUFBRSxDQUFDLE1BQWMsRUFBRSxRQUF1QjtRQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRTdCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVwQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztZQUFDLENBQUM7WUFDM0csSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRSxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBRUQsTUFBTTtJQVNKLFlBQVksTUFBZTtRQUN6QixJ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TUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyQyxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxXQUErQyxRQUF1QixFQUFFLGdCQUFnRTtJQUNwSixJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBRTVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUVwRCxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFTLE1BQWU7UUFDN0MsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFBQyxDQUFDO0lBQzVCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVNYXAgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVsZWdhdGUge1xuICBjb250ZXh0RW50ZXJlZD8oY29udGV4dDogc3RyaW5nLCByb3V0ZTogTWF0Y2hEU0wpOiB2b2lkO1xuICB3aWxsQWRkUm91dGU/KGNvbnRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZCwgcm91dGU6IHN0cmluZyk6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgT3BhcXVlID0ge30gfCB2b2lkIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZSB7XG4gIHBhdGg6IHN0cmluZztcbiAgaGFuZGxlcjogT3BhcXVlO1xuICBxdWVyeVBhcmFtcz86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlUmVjb2duaXplciB7XG4gIGRlbGVnYXRlOiBEZWxlZ2F0ZSB8IHVuZGVmaW5lZDtcbiAgYWRkKHJvdXRlczogUm91dGVbXSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWF0Y2hDYWxsYmFjayB7XG4gIChtYXRjaDogTWF0Y2hEU0wpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1hdGNoRFNMIHtcbiAgKHBhdGg6IHN0cmluZyk6IFRvRFNMO1xuICAocGF0aDogc3RyaW5nLCBjYWxsYmFjazogTWF0Y2hDYWxsYmFjayk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9EU0wge1xuICB0byhuYW1lOiBzdHJpbmcsIGNhbGxiYWNrPzogTWF0Y2hDYWxsYmFjayk6IHZvaWQ7XG59XG5cbmNsYXNzIFRhcmdldCBpbXBsZW1lbnRzIFRvRFNMIHtcbiAgcGF0aDogc3RyaW5nO1xuICBtYXRjaGVyOiBNYXRjaGVyO1xuICBkZWxlZ2F0ZTogRGVsZWdhdGUgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocGF0aDogc3RyaW5nLCBtYXRjaGVyOiBNYXRjaGVyLCBkZWxlZ2F0ZTogRGVsZWdhdGUgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMubWF0Y2hlciA9IG1hdGNoZXI7XG4gICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xuICB9XG5cbiAgdG8odGFyZ2V0OiBzdHJpbmcsIGNhbGxiYWNrOiBNYXRjaENhbGxiYWNrKSB7XG4gICAgbGV0IGRlbGVnYXRlID0gdGhpcy5kZWxlZ2F0ZTtcblxuICAgIGlmIChkZWxlZ2F0ZSAmJiBkZWxlZ2F0ZS53aWxsQWRkUm91dGUpIHtcbiAgICAgIHRhcmdldCA9IGRlbGVnYXRlLndpbGxBZGRSb3V0ZSh0aGlzLm1hdGNoZXIudGFyZ2V0LCB0YXJnZXQpO1xuICAgIH1cblxuICAgIHRoaXMubWF0Y2hlci5hZGQodGhpcy5wYXRoLCB0YXJnZXQpO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBpZiAoY2FsbGJhY2subGVuZ3RoID09PSAwKSB7IHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGhhdmUgYW4gYXJndW1lbnQgaW4gdGhlIGZ1bmN0aW9uIHBhc3NlZCB0byBgdG9gXCIpOyB9XG4gICAgICB0aGlzLm1hdGNoZXIuYWRkQ2hpbGQodGhpcy5wYXRoLCB0YXJnZXQsIGNhbGxiYWNrLCB0aGlzLmRlbGVnYXRlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdGNoZXIge1xuICByb3V0ZXM6IHtcbiAgICBbcGF0aDogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBjaGlsZHJlbjoge1xuICAgIFtwYXRoOiBzdHJpbmddOiBNYXRjaGVyIHwgdW5kZWZpbmVkO1xuICB9O1xuICB0YXJnZXQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXQ/OiBzdHJpbmcpIHtcbiAgICB0aGlzLnJvdXRlcyA9IGNyZWF0ZU1hcDxzdHJpbmc+KCk7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNyZWF0ZU1hcDxNYXRjaGVyPigpO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgYWRkKHBhdGg6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcpIHtcbiAgICB0aGlzLnJvdXRlc1twYXRoXSA9IHRhcmdldDtcbiAgfVxuXG4gIGFkZENoaWxkKHBhdGg6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcsIGNhbGxiYWNrOiBNYXRjaENhbGxiYWNrLCBkZWxlZ2F0ZTogRGVsZWdhdGUgfCB1bmRlZmluZWQpIHtcbiAgICBsZXQgbWF0Y2hlciA9IG5ldyBNYXRjaGVyKHRhcmdldCk7XG4gICAgdGhpcy5jaGlsZHJlbltwYXRoXSA9IG1hdGNoZXI7XG5cbiAgICBsZXQgbWF0Y2ggPSBnZW5lcmF0ZU1hdGNoKHBhdGgsIG1hdGNoZXIsIGRlbGVnYXRlKTtcblxuICAgIGlmIChkZWxlZ2F0ZSAmJiBkZWxlZ2F0ZS5jb250ZXh0RW50ZXJlZCkge1xuICAgICAgZGVsZWdhdGUuY29udGV4dEVudGVyZWQodGFyZ2V0LCBtYXRjaCk7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sobWF0Y2gpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlTWF0Y2goc3RhcnRpbmdQYXRoOiBzdHJpbmcsIG1hdGNoZXI6IE1hdGNoZXIsIGRlbGVnYXRlOiBEZWxlZ2F0ZSB8IHVuZGVmaW5lZCk6IE1hdGNoRFNMIHtcbiAgZnVuY3Rpb24gbWF0Y2gocGF0aDogc3RyaW5nKTogVG9EU0w7XG4gIGZ1bmN0aW9uIG1hdGNoKHBhdGg6IHN0cmluZywgY2FsbGJhY2s6IE1hdGNoQ2FsbGJhY2spOiB2b2lkO1xuICBmdW5jdGlvbiBtYXRjaChwYXRoOiBzdHJpbmcsIGNhbGxiYWNrPzogTWF0Y2hDYWxsYmFjayk6IFRvRFNMIHwgdm9pZCB7XG4gICAgbGV0IGZ1bGxQYXRoID0gc3RhcnRpbmdQYXRoICsgcGF0aDtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKGdlbmVyYXRlTWF0Y2goZnVsbFBhdGgsIG1hdGNoZXIsIGRlbGVnYXRlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgVGFyZ2V0KGZ1bGxQYXRoLCBtYXRjaGVyLCBkZWxlZ2F0ZSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbWF0Y2g7XG59XG5cbmZ1bmN0aW9uIGFkZFJvdXRlKHJvdXRlQXJyYXk6IFJvdXRlW10sIHBhdGg6IHN0cmluZywgaGFuZGxlcjogYW55KSB7XG4gIGxldCBsZW4gPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICBsZW4gKz0gcm91dGVBcnJheVtpXS5wYXRoLmxlbmd0aDtcbiAgfVxuXG4gIHBhdGggPSBwYXRoLnN1YnN0cihsZW4pO1xuICBsZXQgcm91dGUgPSB7IHBhdGg6IHBhdGgsIGhhbmRsZXI6IGhhbmRsZXIgfTtcbiAgcm91dGVBcnJheS5wdXNoKHJvdXRlKTtcbn1cblxuZnVuY3Rpb24gZWFjaFJvdXRlPFQ+KGJhc2VSb3V0ZTogUm91dGVbXSwgbWF0Y2hlcjogTWF0Y2hlciwgY2FsbGJhY2s6ICh0aGlzOiBULCByb3V0ZXM6IFJvdXRlW10pID0+IHZvaWQsIGJpbmRpbmc6IFQpIHtcbiAgbGV0IHJvdXRlcyA9IG1hdGNoZXIucm91dGVzO1xuICBsZXQgcGF0aHMgPSBPYmplY3Qua2V5cyhyb3V0ZXMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHBhdGggPSBwYXRoc1tpXTtcbiAgICBsZXQgcm91dGVBcnJheSA9IGJhc2VSb3V0ZS5zbGljZSgpO1xuICAgIGFkZFJvdXRlKHJvdXRlQXJyYXksIHBhdGgsIHJvdXRlc1twYXRoXSk7XG4gICAgbGV0IG5lc3RlZCA9IG1hdGNoZXIuY2hpbGRyZW5bcGF0aF07XG4gICAgaWYgKG5lc3RlZCkge1xuICAgICAgZWFjaFJvdXRlKHJvdXRlQXJyYXksIG5lc3RlZCwgY2FsbGJhY2ssIGJpbmRpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjay5jYWxsKGJpbmRpbmcsIHJvdXRlQXJyYXkpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiA8VCBleHRlbmRzIFJvdXRlUmVjb2duaXplcj4odGhpczogVCwgY2FsbGJhY2s6IE1hdGNoQ2FsbGJhY2ssIGFkZFJvdXRlQ2FsbGJhY2s/OiAocm91dGVSZWNvZ25pemVyOiBULCByb3V0ZXM6IFJvdXRlW10pID0+IHZvaWQpIHtcbiAgbGV0IG1hdGNoZXIgPSBuZXcgTWF0Y2hlcigpO1xuXG4gIGNhbGxiYWNrKGdlbmVyYXRlTWF0Y2goXCJcIiwgbWF0Y2hlciwgdGhpcy5kZWxlZ2F0ZSkpO1xuXG4gIGVhY2hSb3V0ZShbXSwgbWF0Y2hlciwgZnVuY3Rpb24ocm91dGVzOiBSb3V0ZVtdKSB7XG4gICAgaWYgKGFkZFJvdXRlQ2FsbGJhY2spIHsgYWRkUm91dGVDYWxsYmFjayh0aGlzLCByb3V0ZXMpOyB9XG4gICAgZWxzZSB7IHRoaXMuYWRkKHJvdXRlcyk7IH1cbiAgfSwgdGhpcyk7XG59XG4iXX0=

// Normalizes percent-encoded values in `path` to upper-case and decodes percent-encoded
// values that are not reserved (i.e., unicode characters, emoji, etc). The reserved
// chars are "/" and "%".
// Safe to call multiple times on the same path.
// Normalizes percent-encoded values in `path` to upper-case and decodes percent-encoded
function normalizePath(path) {
    return path.split("/")
        .map(normalizeSegment)
        .join("/");
}
// We want to ensure the characters "%" and "/" remain in percent-encoded
// form when normalizing paths, so replace them with their encoded form after
// decoding the rest of the path
var SEGMENT_RESERVED_CHARS = /%|\//g;
function normalizeSegment(segment) {
    if (segment.length < 3 || segment.indexOf("%") === -1)
        { return segment; }
    return decodeURIComponent(segment).replace(SEGMENT_RESERVED_CHARS, encodeURIComponent);
}
// We do not want to encode these characters when generating dynamic path segments
// See https://tools.ietf.org/html/rfc3986#section-3.3
// sub-delims: "!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "="
// others allowed by RFC 3986: ":", "@"
//
// First encode the entire path segment, then decode any of the encoded special chars.
//
// The chars "!", "'", "(", ")", "*" do not get changed by `encodeURIComponent`,
// so the possible encoded chars are:
// ['%24', '%26', '%2B', '%2C', '%3B', '%3D', '%3A', '%40'].
var PATH_SEGMENT_ENCODINGS = /%(?:2(?:4|6|B|C)|3(?:B|D|A)|40)/g;
function encodePathSegment(str) {
    return encodeURIComponent(str).replace(PATH_SEGMENT_ENCODINGS, decodeURIComponent);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vcm1hbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0ZBQXdGO0FBQ3hGLG9GQUFvRjtBQUNwRix5QkFBeUI7QUFDekIsZ0RBQWdEO0FBQ2hELEFBSkEsd0ZBQXdGO0FBSXhGLE1BQU0sd0JBQXdCLElBQVk7SUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1NBQ1YsR0FBRyxDQUFDLGdCQUFnQixDQUFDO1NBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixDQUFDO0FBRUQseUVBQXlFO0FBQ3pFLDZFQUE2RTtBQUM3RSxnQ0FBZ0M7QUFDaEMsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUM7QUFDdkMsTUFBTSwyQkFBMkIsT0FBZTtJQUM5QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUN0RSxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekYsQ0FBQztBQUVELGtGQUFrRjtBQUNsRixzREFBc0Q7QUFDdEQsb0VBQW9FO0FBQ3BFLHVDQUF1QztBQUN2QyxFQUFFO0FBQ0Ysc0ZBQXNGO0FBQ3RGLEVBQUU7QUFDRixnRkFBZ0Y7QUFDaEYscUNBQXFDO0FBQ3JDLDREQUE0RDtBQUM1RCxNQUFNLHNCQUFzQixHQUFHLGtDQUFrQyxDQUFDO0FBRWxFLE1BQU0sNEJBQTRCLEdBQVc7SUFDM0MsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBOb3JtYWxpemVzIHBlcmNlbnQtZW5jb2RlZCB2YWx1ZXMgaW4gYHBhdGhgIHRvIHVwcGVyLWNhc2UgYW5kIGRlY29kZXMgcGVyY2VudC1lbmNvZGVkXG4vLyB2YWx1ZXMgdGhhdCBhcmUgbm90IHJlc2VydmVkIChpLmUuLCB1bmljb2RlIGNoYXJhY3RlcnMsIGVtb2ppLCBldGMpLiBUaGUgcmVzZXJ2ZWRcbi8vIGNoYXJzIGFyZSBcIi9cIiBhbmQgXCIlXCIuXG4vLyBTYWZlIHRvIGNhbGwgbXVsdGlwbGUgdGltZXMgb24gdGhlIHNhbWUgcGF0aC5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnNwbGl0KFwiL1wiKVxuICAgICAgICAgICAgIC5tYXAobm9ybWFsaXplU2VnbWVudClcbiAgICAgICAgICAgICAuam9pbihcIi9cIik7XG59XG5cbi8vIFdlIHdhbnQgdG8gZW5zdXJlIHRoZSBjaGFyYWN0ZXJzIFwiJVwiIGFuZCBcIi9cIiByZW1haW4gaW4gcGVyY2VudC1lbmNvZGVkXG4vLyBmb3JtIHdoZW4gbm9ybWFsaXppbmcgcGF0aHMsIHNvIHJlcGxhY2UgdGhlbSB3aXRoIHRoZWlyIGVuY29kZWQgZm9ybSBhZnRlclxuLy8gZGVjb2RpbmcgdGhlIHJlc3Qgb2YgdGhlIHBhdGhcbmNvbnN0IFNFR01FTlRfUkVTRVJWRURfQ0hBUlMgPSAvJXxcXC8vZztcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTZWdtZW50KHNlZ21lbnQ6IHN0cmluZykge1xuICBpZiAoc2VnbWVudC5sZW5ndGggPCAzIHx8IHNlZ21lbnQuaW5kZXhPZihcIiVcIikgPT09IC0xKSByZXR1cm4gc2VnbWVudDtcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzZWdtZW50KS5yZXBsYWNlKFNFR01FTlRfUkVTRVJWRURfQ0hBUlMsIGVuY29kZVVSSUNvbXBvbmVudCk7XG59XG5cbi8vIFdlIGRvIG5vdCB3YW50IHRvIGVuY29kZSB0aGVzZSBjaGFyYWN0ZXJzIHdoZW4gZ2VuZXJhdGluZyBkeW5hbWljIHBhdGggc2VnbWVudHNcbi8vIFNlZSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTMuM1xuLy8gc3ViLWRlbGltczogXCIhXCIsIFwiJFwiLCBcIiZcIiwgXCInXCIsIFwiKFwiLCBcIilcIiwgXCIqXCIsIFwiK1wiLCBcIixcIiwgXCI7XCIsIFwiPVwiXG4vLyBvdGhlcnMgYWxsb3dlZCBieSBSRkMgMzk4NjogXCI6XCIsIFwiQFwiXG4vL1xuLy8gRmlyc3QgZW5jb2RlIHRoZSBlbnRpcmUgcGF0aCBzZWdtZW50LCB0aGVuIGRlY29kZSBhbnkgb2YgdGhlIGVuY29kZWQgc3BlY2lhbCBjaGFycy5cbi8vXG4vLyBUaGUgY2hhcnMgXCIhXCIsIFwiJ1wiLCBcIihcIiwgXCIpXCIsIFwiKlwiIGRvIG5vdCBnZXQgY2hhbmdlZCBieSBgZW5jb2RlVVJJQ29tcG9uZW50YCxcbi8vIHNvIHRoZSBwb3NzaWJsZSBlbmNvZGVkIGNoYXJzIGFyZTpcbi8vIFsnJTI0JywgJyUyNicsICclMkInLCAnJTJDJywgJyUzQicsICclM0QnLCAnJTNBJywgJyU0MCddLlxuY29uc3QgUEFUSF9TRUdNRU5UX0VOQ09ESU5HUyA9IC8lKD86Mig/OjR8NnxCfEMpfDMoPzpCfER8QSl8NDApL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVQYXRoU2VnbWVudChzdHI6IHN0cmluZykge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZShQQVRIX1NFR01FTlRfRU5DT0RJTkdTLCBkZWNvZGVVUklDb21wb25lbnQpO1xufVxuIl19

var escapeRegex = /(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\)/g;
var isArray = Array.isArray;
var hasOwnProperty = Object.prototype.hasOwnProperty;
function getParam(params, key) {
    if (typeof params !== "object" || params === null) {
        throw new Error("You must pass an object as the second argument to `generate`.");
    }
    if (!hasOwnProperty.call(params, key)) {
        throw new Error("You must provide param `" + key + "` to `generate`.");
    }
    var value = params[key];
    var str = typeof value === "string" ? value : "" + value;
    if (str.length === 0) {
        throw new Error("You must provide a param `" + key + "`.");
    }
    return str;
}
var eachChar = [];
eachChar[0 /* Static */] = function (segment, currentState) {
    var state = currentState;
    var value = segment.value;
    for (var i = 0; i < value.length; i++) {
        var ch = value.charCodeAt(i);
        state = state.put(ch, false, false);
    }
    return state;
};
eachChar[1 /* Dynamic */] = function (_, currentState) {
    return currentState.put(47 /* SLASH */, true, true);
};
eachChar[2 /* Star */] = function (_, currentState) {
    return currentState.put(-1 /* ANY */, false, true);
};
eachChar[4 /* Epsilon */] = function (_, currentState) {
    return currentState;
};
var regex = [];
regex[0 /* Static */] = function (segment) {
    return segment.value.replace(escapeRegex, "\\$1");
};
regex[1 /* Dynamic */] = function () {
    return "([^/]+)";
};
regex[2 /* Star */] = function () {
    return "(.+)";
};
regex[4 /* Epsilon */] = function () {
    return "";
};
var generate = [];
generate[0 /* Static */] = function (segment) {
    return segment.value;
};
generate[1 /* Dynamic */] = function (segment, params) {
    var value = getParam(params, segment.value);
    if (RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS) {
        return encodePathSegment(value);
    }
    else {
        return value;
    }
};
generate[2 /* Star */] = function (segment, params) {
    return getParam(params, segment.value);
};
generate[4 /* Epsilon */] = function () {
    return "";
};
var EmptyObject = Object.freeze({});
var EmptyArray = Object.freeze([]);
// The `names` will be populated with the paramter name for each dynamic/star
// segment. `shouldDecodes` will be populated with a boolean for each dyanamic/star
// segment, indicating whether it should be decoded during recognition.
function parse(segments, route, types) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.length > 0 && route.charCodeAt(0) === 47 /* SLASH */) {
        route = route.substr(1);
    }
    var parts = route.split("/");
    var names = undefined;
    var shouldDecodes = undefined;
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        var flags = 0;
        var type = 0;
        if (part === "") {
            type = 4 /* Epsilon */;
        }
        else if (part.charCodeAt(0) === 58 /* COLON */) {
            type = 1 /* Dynamic */;
        }
        else if (part.charCodeAt(0) === 42 /* STAR */) {
            type = 2 /* Star */;
        }
        else {
            type = 0 /* Static */;
        }
        flags = 2 << type;
        if (flags & 12 /* Named */) {
            part = part.slice(1);
            names = names || [];
            names.push(part);
            shouldDecodes = shouldDecodes || [];
            shouldDecodes.push((flags & 4 /* Decoded */) !== 0);
        }
        if (flags & 14 /* Counted */) {
            types[type]++;
        }
        segments.push({
            type: type,
            value: normalizeSegment(part)
        });
    }
    return {
        names: names || EmptyArray,
        shouldDecodes: shouldDecodes || EmptyArray,
    };
}
function isEqualCharSpec(spec, char, negate) {
    return spec.char === char && spec.negate === negate;
}
// A State has a character specification and (`charSpec`) and a list of possible
// subsequent states (`nextStates`).
//
// If a State is an accepting state, it will also have several additional
// properties:
//
// * `regex`: A regular expression that is used to extract parameters from paths
//   that reached this accepting state.
// * `handlers`: Information on how to convert the list of captures into calls
//   to registered handlers with the specified parameters
// * `types`: How many static, dynamic or star segments in this route. Used to
//   decide which route to use if multiple registered routes match a path.
//
// Currently, State is implemented naively by looping over `nextStates` and
// comparing a character specification against a character. A more efficient
// implementation would use a hash of keys pointing at one or more next states.
var State = function State(states, id, char, negate, repeat) {
    this.states = states;
    this.id = id;
    this.char = char;
    this.negate = negate;
    this.nextStates = repeat ? id : null;
    this.pattern = "";
    this._regex = undefined;
    this.handlerSets = undefined;
    this.types = undefined;
};
State.prototype.regex = function regex$1 () {
    if (!this._regex) {
        this._regex = new RegExp(this.pattern);
    }
    return this._regex;
};
State.prototype.get = function get (char, negate) {
        var this$1 = this;

    var nextStates = this.nextStates;
    if (nextStates === null)
        { return; }
    if (isArray(nextStates)) {
        for (var i = 0; i < nextStates.length; i++) {
            var child = this$1.states[nextStates[i]];
            if (isEqualCharSpec(child, char, negate)) {
                return child;
            }
        }
    }
    else {
        var child$1 = this.states[nextStates];
        if (isEqualCharSpec(child$1, char, negate)) {
            return child$1;
        }
    }
};
State.prototype.put = function put (char, negate, repeat) {
    var state;
    // If the character specification already exists in a child of the current
    // state, just return that state.
    if (state = this.get(char, negate)) {
        return state;
    }
    // Make a new state for the character spec
    var states = this.states;
    state = new State(states, states.length, char, negate, repeat);
    states[states.length] = state;
    // Insert the new state as a child of the current state
    if (this.nextStates == null) {
        this.nextStates = state.id;
    }
    else if (isArray(this.nextStates)) {
        this.nextStates.push(state.id);
    }
    else {
        this.nextStates = [this.nextStates, state.id];
    }
    // Return the new state
    return state;
};
// Find a list of child states matching the next character
State.prototype.match = function match (ch) {
        var this$1 = this;

    var nextStates = this.nextStates;
    if (!nextStates)
        { return []; }
    var returned = [];
    if (isArray(nextStates)) {
        for (var i = 0; i < nextStates.length; i++) {
            var child = this$1.states[nextStates[i]];
            if (isMatch(child, ch)) {
                returned.push(child);
            }
        }
    }
    else {
        var child$1 = this.states[nextStates];
        if (isMatch(child$1, ch)) {
            returned.push(child$1);
        }
    }
    return returned;
};
function isMatch(spec, char) {
    return spec.negate ? spec.char !== char && spec.char !== -1 /* ANY */ : spec.char === char || spec.char === -1 /* ANY */;
}
// This is a somewhat naive strategy, but should work in a lot of cases
// A better strategy would properly resolve /posts/:id/new and /posts/edit/:id.
//
// This strategy generally prefers more static and less dynamic matching.
// Specifically, it
//
//  * prefers fewer stars to more, then
//  * prefers using stars for less of the match to more, then
//  * prefers fewer dynamic segments to more, then
//  * prefers more static segments to more
function sortSolutions(states) {
    return states.sort(function (a, b) {
        var ref = a.types || [0, 0, 0];
        var astatics = ref[0];
        var adynamics = ref[1];
        var astars = ref[2];
        var ref$1 = b.types || [0, 0, 0];
        var bstatics = ref$1[0];
        var bdynamics = ref$1[1];
        var bstars = ref$1[2];
        if (astars !== bstars) {
            return astars - bstars;
        }
        if (astars) {
            if (astatics !== bstatics) {
                return bstatics - astatics;
            }
            if (adynamics !== bdynamics) {
                return bdynamics - adynamics;
            }
        }
        if (adynamics !== bdynamics) {
            return adynamics - bdynamics;
        }
        if (astatics !== bstatics) {
            return bstatics - astatics;
        }
        return 0;
    });
}
function recognizeChar(states, ch) {
    var nextStates = [];
    for (var i = 0, l = states.length; i < l; i++) {
        var state = states[i];
        nextStates = nextStates.concat(state.match(ch));
    }
    return nextStates;
}
var RecognizeResults = function RecognizeResults(queryParams) {
    this.length = 0;
    this.queryParams = queryParams || {};
};

RecognizeResults.prototype.splice = Array.prototype.splice;
RecognizeResults.prototype.slice = Array.prototype.slice;
RecognizeResults.prototype.push = Array.prototype.push;
function findHandlers(state, originalPath, queryParams) {
    var regex = state.regex();
    var handlerSets = state.handlerSets;
    if (!regex || !handlerSets)
        { throw new Error("state not initialized"); }
    var captures = originalPath.match(regex);
    var currentCapture = 1;
    var results = [];
    for (var h = 0; h < handlerSets.length; h++) {
        var handlers = handlerSets[h];
        var result = new RecognizeResults(queryParams);
        result.length = handlers.length;
        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];
            var names = handler.names;
            var shouldDecodes = handler.shouldDecodes;
            var params = EmptyObject;
            var isDynamic = false;
            if (names !== EmptyArray && shouldDecodes !== EmptyArray) {
                for (var j = 0; j < names.length; j++) {
                    isDynamic = true;
                    var name = names[j];
                    var capture = captures && captures[currentCapture++];
                    if (params === EmptyObject) {
                        params = {};
                    }
                    if (RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS && shouldDecodes[j]) {
                        params[name] = capture && decodeURIComponent(capture);
                    }
                    else {
                        params[name] = capture;
                    }
                }
            }
            result[i] = {
                handler: handler.handler,
                params: params,
                isDynamic: isDynamic
            };
        }
        results.push(result);
    }
    return results;
}
function decodeQueryParamPart(part) {
    // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
    part = part.replace(/\+/gm, "%20");
    var result;
    try {
        result = decodeURIComponent(part);
    }
    catch (error) {
        result = "";
    }
    return result;
}
var RouteRecognizer = function RouteRecognizer() {
    this.names = createMap();
    var states = [];
    var state = new State(states, 0, -1 /* ANY */, true, false);
    states[0] = state;
    this.states = states;
    this.rootState = state;
};
RouteRecognizer.prototype.add = function add (routes, options) {
    var currentState = this.rootState;
    var pattern = "^";
    var types = [0, 0, 0];
    var handlers = new Array(routes.length);
    var allSegments = [];
    var isEmpty = true;
    var j = 0;
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var ref = parse(allSegments, route.path, types);
            var names = ref.names;
            var shouldDecodes = ref.shouldDecodes;
        // preserve j so it points to the start of newly added segments
        for (; j < allSegments.length; j++) {
            var segment = allSegments[j];
            if (segment.type === 4 /* Epsilon */) {
                continue;
            }
            isEmpty = false;
            // Add a "/" for the new segment
            currentState = currentState.put(47 /* SLASH */, false, false);
            pattern += "/";
            // Add a representation of the segment to the NFA and regex
            currentState = eachChar[segment.type](segment, currentState);
            pattern += regex[segment.type](segment);
        }
        handlers[i] = {
            handler: route.handler,
            names: names,
            shouldDecodes: shouldDecodes
        };
    }
    if (isEmpty) {
        currentState = currentState.put(47 /* SLASH */, false, false);
        pattern += "/";
    }
    var name;
    if (typeof options === "object" && options !== null && options.as) {
        name = options.as;
    }
    currentState.handlerSets = currentState.handlerSets || [];
    currentState.handlerSets.push(handlers);
    currentState.pattern = pattern + "$";
    currentState.types = types;
    if (name) {
        // if (this.names[name]) {
        //   throw new Error("You may not add a duplicate route named `" + name + "`.");
        // }
        this.names[name] = {
            segments: allSegments,
            handlers: handlers
        };
    }
};
RouteRecognizer.prototype.handlersFor = function handlersFor (name) {
    var route = this.names[name];
    if (!route) {
        throw new Error("There is no route named " + name);
    }
    var result = new Array(route.handlers.length);
    for (var i = 0; i < route.handlers.length; i++) {
        var handler = route.handlers[i];
        result[i] = handler;
    }
    return result;
};
RouteRecognizer.prototype.hasRoute = function hasRoute (name) {
    return !!this.names[name];
};
RouteRecognizer.prototype.generate = function generate$1 (name, params) {
    var route = this.names[name];
    var output = "";
    if (!route) {
        throw new Error("There is no route named " + name);
    }
    var segments = route.segments;
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (segment.type === 4 /* Epsilon */) {
            continue;
        }
        output += "/";
        output += generate[segment.type](segment, params);
    }
    if (output.charAt(0) !== "/") {
        output = "/" + output;
    }
    if (params && params.queryParams) {
        output += this.generateQueryString(params.queryParams);
    }
    return output;
};
RouteRecognizer.prototype.generateQueryString = function generateQueryString (params) {
    var pairs = [];
    var keys = Object.keys(params);
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = params[key];
        if (value == null) {
            continue;
        }
        var pair = encodeURIComponent(key);
        if (isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                var arrayPair = key + "[]" + "=" + encodeURIComponent(value[j]);
                pairs.push(arrayPair);
            }
        }
        else {
            pair += "=" + encodeURIComponent(value);
            pairs.push(pair);
        }
    }
    if (pairs.length === 0) {
        return "";
    }
    return "?" + pairs.join("&");
};
RouteRecognizer.prototype.parseQueryString = function parseQueryString (queryString) {
    var pairs = queryString.split("&");
    var queryParams = {};
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("="), key = decodeQueryParamPart(pair[0]), keyLength = key.length, isArray = false, value = (void 0);
        if (pair.length === 1) {
            value = "true";
        }
        else {
            // Handle arrays
            if (keyLength > 2 && key.slice(keyLength - 2) === "[]") {
                isArray = true;
                key = key.slice(0, keyLength - 2);
                if (!queryParams[key]) {
                    queryParams[key] = [];
                }
            }
            value = pair[1] ? decodeQueryParamPart(pair[1]) : "";
        }
        if (isArray) {
            queryParams[key].push(value);
        }
        else {
            queryParams[key] = value;
        }
    }
    return queryParams;
};
RouteRecognizer.prototype.recognize = function recognize (path) {
    return this.recognizeAll(path)[0];
};
RouteRecognizer.prototype.recognizeAll = function recognizeAll (path) {
    var states = [this.rootState];
    var queryParams = {};
    var isSlashDropped = false;
    var hashStart = path.indexOf("#");
    if (hashStart !== -1) {
        path = path.substr(0, hashStart);
    }
    var queryStart = path.indexOf("?");
    if (queryStart !== -1) {
        var queryString = path.substr(queryStart + 1, path.length);
        path = path.substr(0, queryStart);
        queryParams = this.parseQueryString(queryString);
    }
    if (path.charAt(0) !== "/") {
        path = "/" + path;
    }
    var originalPath = path;
    if (RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS) {
        path = normalizePath(path);
    }
    else {
        path = decodeURI(path);
        originalPath = decodeURI(originalPath);
    }
    var pathLen = path.length;
    if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
        path = path.substr(0, pathLen - 1);
        originalPath = originalPath.substr(0, originalPath.length - 1);
        isSlashDropped = true;
    }
    for (var i = 0; i < path.length; i++) {
        states = recognizeChar(states, path.charCodeAt(i));
        if (!states.length) {
            break;
        }
    }
    var solutions = [];
    for (var i$1 = 0; i$1 < states.length; i$1++) {
        if (states[i$1].handlerSets) {
            solutions.push(states[i$1]);
        }
    }
    var results = [];
    var sortedSolutions = sortSolutions(solutions);
    for (var s = 0; s < sortedSolutions.length; s++) {
        var state = sortedSolutions[s];
        var op = originalPath;
        // if a trailing slash was dropped and a star segment is the last segment
        // specified, put the trailing slash back
        if (isSlashDropped && state.pattern && state.pattern.slice(-5) === "(.+)$") {
            op = originalPath + "/";
        }
        var handlerResults = findHandlers(state, op, queryParams);
        for (var h = 0; h < handlerResults.length; h++) {
            results.push(handlerResults[h]);
        }
    }
    return results;
};
RouteRecognizer.VERSION = "0.3.3";
// Set to false to opt-out of encoding and decoding path segments.
// See https://github.com/tildeio/route-recognizer/pull/55
RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS = true;
RouteRecognizer.Normalizer = {
    normalizeSegment: normalizeSegment, normalizePath: normalizePath, encodePathSegment: encodePathSegment
};
RouteRecognizer.prototype.map = map;

export default RouteRecognizer;

//# sourceMappingURL=route-recognizer.es.js.map
