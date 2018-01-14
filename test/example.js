import Foo from "foo";
import { poof, paf } from "pif";
import { cool as great } from "awesome";
import type eggs from "eggs";

function* genFunc() {
  console.log("First");
  yield; // (A)
  console.log("Second"); // (B)
}

let genObj = genFunc();

genObj.next();

document.body.addEventListener("click", function(evt) {
  console.log(evt, this); // EventObject, BodyElement
});

var users = [
  { name: "Jack", age: 21 },
  { name: "Ben", age: 23 },
  { name: "Adam", age: 22 }
];

function Person(name) {
  this.name = name;
}

Person.prototype.prefixName = function(arr) {
  return arr.map(function(character) {
    return this.name + character; // Cannot read property 'name' of undefined
  });
};

class FooButBetter extends Foo {
  constructor() {
    this.someVariable = "123";
  }

  foo(otherCallback) {
    callback(() => otherCallback(1));
  }
}

// This variable does something
var a = 1;
let b = 2;
const c = 3,
  d = 4;

/**
 * A description of Bar()
 */
function Bar() {
  const WOOT = "WOOT";
  this.yay = "YAY";
}

const YAAAAY = () => "woot"

console.log(YAAAAY());

type spam = string;

/*




BLAH




 */
