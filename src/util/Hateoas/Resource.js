import Hal from "./Hal";
import Hateoas from "./Hateoas";
import Link from "./Link";

//Class that add to objects utility functions
//Uses href extracter
export default class Resource {
  static #link(obj, linkName = "self", extracter) {
    var href = extracter.getHref(obj, linkName);
    return href ? new Link(href) : null;
  }

  //Calls callback function if link is specified in link list: onLink('auf', (link) => link.fetch())
  static #onLink(obj, linkName, callback, extracter) {
    var link = this.#link(obj, linkName, extracter);
    if (link) callback(link);
  }

  //Returns response collection with such name
  static #list(obj, listName, extracter) {
    return extracter.getCollection(obj, listName);
  }

  static basedOnHref(selfHref, extracter) {
    var obj = this.wrap({}, extracter);
    obj.link = (linkName) => new Link(selfHref);
    return obj;
  }

  static based(selfLink, extracter) {
    var obj = this.wrap({}, extracter);
    obj.link = (linkName) => selfLink;
    return obj;
  }

  static basedList(links, extracter) {
    var obj = this.wrap({}, extracter);
    obj.link = (linkName) => links[linkName] ?? null;
    return obj;
  }

  //Adds functions to object. Uses default HAL href extracter
  static wrap(obj, extracter) {
    extracter = extracter ?? new Hal();
    obj.link = (linkName) => this.#link(obj, linkName, extracter);
    obj.onLink = (linkName, callback) =>
      this.#onLink(obj, linkName, callback, extracter);
    obj.list = (listName) => this.#list(obj, listName, extracter);
    return obj;
  }

  //Create new object of resource. Uses default HAL href extracter
  static of(obj, extracter) {
    return this.wrap(Object.assign({}, obj), extracter);
  }
}
